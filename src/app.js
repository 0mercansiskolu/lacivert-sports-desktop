let channels = JSON.parse(localStorage.getItem('lacivert:channels') || '[]');
const $ = (selector) => document.querySelector(selector);
const grid = $('#channelGrid');
const frame = $('#mainFrame');
const placeholder = $('#playerPlaceholder');
let activeId = localStorage.getItem('lacivert:lastChannel') || '';
let favoritesOnly = false;
let favorites = new Set(JSON.parse(localStorage.getItem('lacivert:favorites') || '[]'));

function showToast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => $('#toast').classList.remove('show'), 1800);
}
function save() {
  localStorage.setItem('lacivert:channels', JSON.stringify(channels));
  localStorage.setItem('lacivert:favorites', JSON.stringify([...favorites]));
}
function filteredChannels() {
  const query = $('#searchInput').value.toLocaleLowerCase('tr-TR').trim();
  return channels.filter((channel) => channel.name.toLocaleLowerCase('tr-TR').includes(query) && (!favoritesOnly || favorites.has(channel.id)));
}
function renderChannels() {
  const list = filteredChannels();
  grid.replaceChildren();
  $('#count').textContent = list.length;
  if (!list.length) {
    grid.innerHTML = '<div class="empty">Henüz kanal eklenmedi veya filtreyle eşleşen kanal yok.</div>';
    return;
  }
  list.forEach((channel) => {
    const card = document.createElement('article');
    card.className = `channel-card${channel.id === activeId ? ' active' : ''}`;
    const top = document.createElement('div');
    top.className = 'card-top';
    top.innerHTML = '<div class="channel-icon">▶</div>';
    const favorite = document.createElement('button');
    favorite.className = `favorite${favorites.has(channel.id) ? ' on' : ''}`;
    favorite.title = 'Favoriye ekle / çıkar';
    favorite.textContent = favorites.has(channel.id) ? '★' : '☆';
    favorite.onclick = (event) => {
      event.stopPropagation();
      favorites.has(channel.id) ? favorites.delete(channel.id) : favorites.add(channel.id);
      save(); renderChannels();
    };
    const remove = document.createElement('button');
    remove.className = 'remove-channel'; remove.title = 'Kanalı sil'; remove.textContent = '×';
    remove.onclick = (event) => {
      event.stopPropagation();
      channels = channels.filter((item) => item.id !== channel.id);
      favorites.delete(channel.id); save();
      if (activeId === channel.id) clearPlayer();
      renderChannels(); showToast(`${channel.name} silindi`);
    };
    top.append(favorite, remove);
    const bottom = document.createElement('div');
    bottom.innerHTML = '<div class="channel-name"></div><div class="channel-sub">Kayıtlı yayın kaynağı</div>';
    bottom.firstElementChild.textContent = channel.name;
    card.append(top, bottom);
    card.onclick = () => playChannel(channel);
    grid.appendChild(card);
  });
}
function clearPlayer() {
  activeId = ''; localStorage.removeItem('lacivert:lastChannel');
  frame.removeAttribute('src'); placeholder.classList.remove('hidden');
  $('#nowPlaying').textContent = 'Kanal Seçiniz';
}
function playChannel(channel) {
  activeId = channel.id; localStorage.setItem('lacivert:lastChannel', activeId);
  frame.src = channel.url; placeholder.classList.add('hidden');
  $('#nowPlaying').textContent = channel.name; renderChannels();
}

$('#sourceForm').onsubmit = (event) => {
  event.preventDefault();
  let url;
  try {
    url = new URL($('#channelUrlInput').value.trim());
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
  } catch { return showToast('Geçerli bir http/https adresi girin'); }
  const channel = { id: crypto.randomUUID(), name: $('#channelNameInput').value.trim(), url: url.href };
  channels.unshift(channel); save(); event.currentTarget.reset(); playChannel(channel);
  showToast(`${channel.name} eklendi`);
};
$('#searchInput').oninput = renderChannels;
$('#favoritesFilter').onclick = () => {
  favoritesOnly = !favoritesOnly;
  $('#favoritesFilter').classList.toggle('active', favoritesOnly);
  $('#favoritesFilter').textContent = favoritesOnly ? '★ Favoriler' : '☆ Favoriler'; renderChannels();
};
$('#refreshBtn').onclick = () => {
  if (!frame.getAttribute('src')) return showToast('Önce bir kanal seç');
  frame.src = frame.src; showToast('Yayın yenilendi');
};
$('#fullscreenBtn').onclick = () => window.desktopAPI.toggleFullscreen();
$('#minBtn').onclick = () => window.desktopAPI.minimize();
$('#maxBtn').onclick = () => window.desktopAPI.maximize();
$('#closeBtn').onclick = () => window.desktopAPI.close();
$('#pinBtn').onclick = async () => {
  const state = await window.desktopAPI.getWindowState();
  const enabled = await window.desktopAPI.setAlwaysOnTop(!state.alwaysOnTop);
  $('#pinBtn').classList.toggle('active', enabled);
  showToast(enabled ? 'Pencere her zaman üstte' : 'Her zaman üstte kapatıldı');
};
window.desktopAPI.onWindowState((state) => {
  $('#maxBtn').textContent = state.maximized ? '❐' : '□';
  $('#pinBtn').classList.toggle('active', state.alwaysOnTop);
});
function updateClock() { $('#clock').textContent = new Date().toLocaleTimeString('tr-TR'); }
setInterval(updateClock, 1000); updateClock(); renderChannels();
window.addEventListener('load', () => {
  setTimeout(() => $('#splash').classList.add('hide'), 1000);
  const last = channels.find((channel) => channel.id === activeId);
  if (last) setTimeout(() => playChannel(last), 1100);
});

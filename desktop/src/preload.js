const {contextBridge,ipcRenderer}=require('electron');contextBridge.exposeInMainWorld('browser',{cmd:(c,a)=>ipcRenderer.invoke('cmd',c,a),onState:f=>ipcRenderer.on('state',(_e,s)=>f(s))});

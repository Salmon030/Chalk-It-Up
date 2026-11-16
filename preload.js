const{contextBridge,ipcRenderer}=require("electron");
contextBridge.exposeInMainWorld("chalkDesktop",{get:k=>ipcRenderer.sendSync("store:get",k),set:(k,v)=>ipcRenderer.sendSync("store:set",k,v),del:k=>ipcRenderer.sendSync("store:del",k),save:(n,d)=>ipcRenderer.invoke("save",n,d),ai:p=>ipcRenderer.invoke("ai",p),quit:()=>ipcRenderer.send("quit")});

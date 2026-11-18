const{app,BrowserWindow,ipcMain,dialog,shell}=require("electron"),fs=require("fs"),path=require("path");
if(!app.requestSingleInstanceLock())app.quit();
app.setAppUserModelId("com.chalkitup.game");
const file=()=>path.join(app.getPath("userData"),"chalk-store.json");
let store={},dirty=false;try{store=JSON.parse(fs.readFileSync(file(),"utf8"))}catch(e){}
const flush=()=>{try{fs.writeFileSync(file(),JSON.stringify(store));dirty=false}catch(e){}};
setInterval(()=>{if(dirty)flush()},3000);app.on("before-quit",flush);
ipcMain.on("store:get",(e,k)=>{e.returnValue=store[k]===undefined?null:store[k]});
ipcMain.on("store:set",(e,k,v)=>{store[k]=v;dirty=true;e.returnValue=true});
ipcMain.on("store:del",(e,k)=>{delete store[k];dirty=true;e.returnValue=true});
ipcMain.on("quit",()=>{flush();app.quit()});
ipcMain.handle("save",async(e,name,data)=>{const r=await dialog.showSaveDialog(BrowserWindow.getFocusedWindow(),{defaultPath:name});if(r.canceled||!r.filePath)return false;fs.writeFileSync(r.filePath,typeof data==="string"?data:Buffer.from(data));return true});
const DEF={gemini:"https://generativelanguage.googleapis.com/v1beta/openai",ollama:"http://localhost:11434/v1"};
let gemModel=null;
async function geminiModel(base,key){if(gemModel)return gemModel;try{const r=await fetch(base+"/models",{headers:{Authorization:"Bearer "+key},signal:AbortSignal.timeout(15000)});const j=await r.json();const ids=(j.data||[]).map(m=>String(m.id).replace("models/","")).filter(id=>/^gemini-[0-9.]+-flash$/.test(id));ids.sort((a,b)=>parseFloat(b.slice(7))-parseFloat(a.slice(7)));if(ids[0])return gemModel=ids[0]}catch(e){}return"gemini-2.5-flash"}
ipcMain.handle("ai",async(e,a)=>{const prov=store.provider||"anthropic",imgs=a.images||[];
if(prov==="anthropic"){const key=process.env.ANTHROPIC_API_KEY||store.apiKey;if(!key)throw new Error("No API key yet. Paste one into the AI Link screen, or choose a free provider there.");
const content=imgs.map(d=>({type:"image",source:{type:"base64",media_type:d.mime||"image/png",data:d.data}}));content.push({type:"text",text:a.prompt});
const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",signal:AbortSignal.timeout(120000),headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:store.model||"claude-sonnet-5-5",max_tokens:8000,messages:[{role:"user",content}]})});
if(!r.ok)throw new Error("Anthropic API "+r.status+": "+(await r.text()).slice(0,300));const j=await r.json();return j.content.map(x=>x.text||"").join("")}
let base=store.baseUrl||DEF[prov]||"";while(base.endsWith("/"))base=base.slice(0,-1);if(!base)throw new Error("Set a server address in the AI Link screen.");
const key=store.apiKey||"";if(prov!=="ollama"&&!key)throw new Error("No API key yet. Paste one into the AI Link screen.");
const model=store.model||(prov==="gemini"?await geminiModel(base,key):"llava");
let content=a.prompt;if(imgs.length){content=[{type:"text",text:a.prompt}];for(const d of imgs)content.push({type:"image_url",image_url:{url:"data:"+(d.mime||"image/png")+";base64,"+d.data}})}
const h={"content-type":"application/json"};if(key)h.authorization="Bearer "+key;
let r;try{r=await fetch(base+"/chat/completions",{method:"POST",signal:AbortSignal.timeout(180000),headers:h,body:JSON.stringify({model,messages:[{role:"user",content}]})})}catch(err){const c=err.cause&&err.cause.code;throw new Error(c==="ECONNREFUSED"?"Cannot reach "+base+". Is the server running?":String(err.message))}
if(!r.ok)throw new Error("AI server "+r.status+": "+(await r.text()).slice(0,300));const j=await r.json();return(j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content)||""});
function createWindow(){const w=new BrowserWindow({width:1280,height:800,minWidth:800,minHeight:520,backgroundColor:"#1b2823",title:"Chalk It Up!",icon:path.join(__dirname,"build","icon.png"),webPreferences:{preload:path.join(__dirname,"preload.js"),contextIsolation:true,nodeIntegration:false}});
w.setMenuBarVisibility(false);w.loadFile("index.html");
w.webContents.setWindowOpenHandler(({url})=>{shell.openExternal(url);return{action:"deny"}});
w.webContents.on("will-navigate",(e,url)=>{if(!url.startsWith("file:"))e.preventDefault()});
w.webContents.on("before-input-event",(e,i)=>{if(i.type==="keyDown"&&i.key==="F11"){w.setFullScreen(!w.isFullScreen());e.preventDefault()}});return w}
app.whenReady().then(()=>{createWindow();app.on("activate",()=>{if(!BrowserWindow.getAllWindows().length)createWindow()})});
app.on("second-instance",()=>{const w=BrowserWindow.getAllWindows()[0];if(w){if(w.isMinimized())w.restore();w.focus()}});
app.on("window-all-closed",()=>app.quit());

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import { initialPreview, type Collection, type PreviewState, type RecordRow, type Settings } from './seed';
export const STORAGE_KEY='sentinel-console-preview-v1';
export function readPreview(raw:string|null):PreviewState {
 const seed=initialPreview();
 if (!raw) return seed;
 try {
  const value=JSON.parse(raw);
  if(value?.version!==1 || !value.collections || !value.settings || !Array.isArray(value.audit)) return seed;
  for(const key of Object.keys(seed.collections) as Collection[]) {
   if(!Array.isArray(value.collections[key]) || !value.collections[key].every((r:RecordRow)=>r&&typeof r.id==='string'&&typeof r.name==='string'&&typeof r.status==='string'&&Object.values(r).every(v=>['string','number','boolean'].includes(typeof v)))) return seed;
  }
  for(const key of Object.keys(seed.settings) as (keyof Settings)[]) if(typeof value.settings[key]!==typeof seed.settings[key]) return seed;
  if(!value.audit.every((entry:Record<string,unknown>)=>entry && ['id','time','actor','action','resource'].every(key=>typeof entry[key]==='string'))) return seed;
  return value;
 } catch {return seed;}
}
export function applyRecordChange(state:PreviewState,collection:Collection,row:RecordRow,action:string):PreviewState {
 const exists=state.collections[collection].some(r=>r.id===row.id);
 return {...state,collections:{...state.collections,[collection]:exists?state.collections[collection].map(r=>r.id===row.id?row:r):[row,...state.collections[collection]]},audit:[{id:crypto.randomUUID(),time:new Date().toISOString(),actor:'Alex Carter',action,resource:`${collection}: ${row.name}`},...state.audit]};
}
type PreviewContextValue={state:PreviewState;save:(collection:Collection,row:RecordRow,action?:string)=>void;settings:(patch:Partial<Settings>)=>void;notify:(message:string)=>void;log:(action:string,resource:string)=>void;block:(ip:string,reason:string)=>void};
const PreviewContext=createContext<PreviewContextValue|null>(null);
export function PreviewProvider({children}:{children:ReactNode}) {
 const [state,setState]=useState<PreviewState>(()=>{try{return readPreview(localStorage.getItem(STORAGE_KEY));}catch{return initialPreview();}});
 const [notice,notify]=useState('');
 useEffect(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{notify('Browser storage is unavailable. Changes will last only for this session.');}},[state]);
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>notify(''),4500);return()=>clearTimeout(timer);},[notice]);
 const log=(action:string,resource:string)=>setState(old=>({...old,audit:[{id:crypto.randomUUID(),time:new Date().toISOString(),actor:'Alex Carter',action,resource},...old.audit]}));
 const save=(collection:Collection,row:RecordRow,action='Updated')=>{setState(old=>applyRecordChange(old,collection,row,action));notify(`${row.name}: ${action.toLowerCase()} in local preview.`);};
 const settings=(patch:Partial<Settings>)=>{setState(old=>({...old,settings:{...old.settings,...patch},audit:[{id:crypto.randomUUID(),time:new Date().toISOString(),actor:'Alex Carter',action:'Updated settings',resource:Object.keys(patch).join(', ')},...old.audit]}));notify('Settings saved in local preview.');};
 const block=(ip:string,reason:string)=>{setState(old=>{
  const existing=old.collections.blocklist.find(r=>r.name===ip);
  let next=applyRecordChange(old,'blocklist',{id:existing?.id??crypto.randomUUID(),name:ip,status:'Active',reason,owner:'Alex Carter',expires:new Date(Date.now()+86400000).toISOString().slice(0,10),scope:'All APIs'},'Blocked source in preview');
  next={...next,collections:{...next.collections,actors:next.collections.actors.map(r=>r.name===ip?{...r,status:'Blocked'}:r)}};
  return next;
 });notify(`${ip} added to the local preview blocklist. No live enforcement.`);};
 return <PreviewContext.Provider value={{state,save,settings,notify,log,block}}>{children}{notice&&<div className="so-toast sc-toast" role="status"><Check size={16}/>{notice}<button aria-label="Dismiss notification" onClick={()=>notify('')}><X size={14}/></button></div>}</PreviewContext.Provider>;
}
export function usePreview(){const ctx=useContext(PreviewContext);if(!ctx)throw new Error('PreviewProvider missing');return ctx;}
export function downloadFile(name:string,value:unknown){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function csvCell(value:unknown){let text=String(value??'');if(/^[=+@\-\t\r]/.test(text))text=`'${text}`;return `"${text.replace(/"/g,'""')}"`;}
export function exportRows(name:string,rows:RecordRow[]){const keys=[...new Set(rows.flatMap(Object.keys))];const csv=[keys.map(csvCell).join(','),...rows.map(row=>keys.map(key=>csvCell(row[key])).join(','))].join('\r\n');const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`${name}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

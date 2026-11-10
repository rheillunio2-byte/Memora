import * as pdfjs from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
export type ExtractedDocument = { text:string; pages:number; warnings:string[] };
export async function extractFile(file:File):Promise<ExtractedDocument>{
  const ext=file.name.split(".").pop()?.toLowerCase();
  if(file.size>20*1024*1024) throw new Error("File is larger than the 20 MB limit.");
  if(ext==="txt") return {text:await file.text(),pages:1,warnings:[]};
  if(ext==="pdf"){
    const pdf=await pdfjs.getDocument({data:await file.arrayBuffer()}).promise;
    const chunks:string[]=[]; const warnings:string[]=[];
    for(let i=1;i<=pdf.numPages;i++){
      const page=await pdf.getPage(i); const content=await page.getTextContent();
      const text=content.items.map((item:any)=>"str" in item?item.str:"").join(" ").replace(/\s+/g," ").trim();
      if(text.length<20) warnings.push(`Page ${i} contains little extractable text. It may be scanned or image-based.`);
      chunks.push(`\n\n[Page ${i}]\n${text}`);
    }
    return {text:chunks.join(""),pages:pdf.numPages,warnings};
  }
  if(ext==="docx"){
    const mammoth=await import("mammoth");
    const result=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});
    return {text:result.value,pages:1,warnings:result.messages.map(m=>m.message)};
  }
  if(ext==="pptx"){
    const JSZip=(await import("jszip")).default; const zip=await JSZip.loadAsync(await file.arrayBuffer());
    const slides=Object.keys(zip.files).filter(k=>/^ppt\/slides\/slide\d+\.xml$/.test(k)).sort((a,b)=>Number(a.match(/slide(\d+)/)?.[1])-Number(b.match(/slide(\d+)/)?.[1]));
    const chunks:string[]=[];
    for(const path of slides){ const xml=await zip.file(path)!.async("text"); const values=[...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map(m=>m[1].replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">")); chunks.push(`[${path.split("/").pop()}] ${values.join(" ")}`); }
    return {text:chunks.join("\n\n"),pages:slides.length,warnings:slides.length?[]:["No readable slide text found."]};
  }
  throw new Error("Unsupported file. Upload PDF, DOCX, PPTX, or TXT.");
}
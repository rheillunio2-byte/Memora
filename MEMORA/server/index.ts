import express from "express";
import cors from "cors";
import { z } from "zod";
const app=express(); app.use(cors()); app.use(express.json({limit:"8mb"}));
const PORT=Number(process.env.PORT||8787);
const GenerateSchema=z.object({text:z.string().max(180000),topic:z.string().max(200).default("General"),instruction:z.string().max(3000).default(""),count:z.number().int().min(1).max(60).default(10),difficulty:z.string().default("Mixed"),output:z.string().default("Complete study set")});
async function gemini(prompt:string){
  const key=process.env.GEMINI_API_KEY;
  if(!key) throw new Error("AI is not configured yet. Add GEMINI_API_KEY to your .env file. You can still use manual study tools.");
  const model=process.env.GEMINI_MODEL||"gemini-2.0-flash";
  const res=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:"application/json",temperature:0.25}})});
  if(!res.ok) throw new Error(`Gemini request failed (${res.status}). Check your API key, model, and quota.`);
  const data:any=await res.json(); const raw=data.candidates?.[0]?.content?.parts?.map((p:any)=>p.text||"").join("");
  if(!raw) throw new Error("The AI returned an empty response.");
  return JSON.parse(raw.replace(/^```json\s*/,"").replace(/\s*```$/,""));
}
app.get("/api/health",(_req,res)=>res.json({ok:true,aiConfigured:Boolean(process.env.GEMINI_API_KEY)}));
app.post("/api/generate",async(req,res)=>{
  const parsed=GenerateSchema.safeParse(req.body); if(!parsed.success) return res.status(400).json({error:"Invalid generation settings."});
  const v=parsed.data;
  if(v.text.trim().length<30) return res.status(400).json({error:"Provide at least 30 characters of source text or a detailed topic prompt."});
  try{
    const prompt=`You are MEMORA, a careful source-grounded learning assistant. Treat SOURCE as the only factual authority. Never invent facts, dates, names, definitions, or laws. If a requested item is not supported, omit it or mark supported:false. Return ONLY valid JSON with keys reviewer (markdown string), terms (array of {term,definition}), questions (array of {id,type,question,choices,answer,explanation,topic,difficulty,source,supported}), cards (array of {front,back,topic}), sourceMode. Question type must be multiple-choice, true-false, identification, or short-answer. Every question must be answerable from SOURCE; cite page/section labels where present. For MCQ, provide exactly four plausible choices and answer matching one choice. Make ${v.count} questions. Difficulty: ${v.difficulty}. Output focus: ${v.output}. Topic: ${v.topic}. Extra instructions: ${v.instruction}. Keep reviewer comprehensive, clear, organized with headings, definitions, key points and memory tips. SOURCE:\n${v.text.slice(0,160000)}`;
    const result=await gemini(prompt); result.sourceMode="Uploaded/pasted source";
    return res.json(result);
  }catch(e:any){return res.status(502).json({error:e.message||"AI generation failed."});}
});
app.post("/api/ask",async(req,res)=>{
  const schema=z.object({question:z.string().min(2).max(3000),context:z.string().max(160000).default("")});
  const p=schema.safeParse(req.body); if(!p.success) return res.status(400).json({error:"Enter a valid question."});
  try{const answer=await gemini(`Answer the user's study question. Use the supplied source as the primary authority. Separate source-supported facts from general explanation. If source does not answer, say so. Return JSON: {"answer":"markdown string"}. QUESTION: ${p.data.question}\nSOURCE:\n${p.data.context.slice(0,150000)}`);res.json(answer);}
  catch(e:any){res.status(502).json({error:e.message||"AI request failed."});}
});
app.listen(PORT,()=>console.log(`MEMORA API listening on http://localhost:${PORT}`));
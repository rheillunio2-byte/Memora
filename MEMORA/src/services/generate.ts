import type { StudyQuestion } from "../types";
export async function generateStudy(input:{text:string;topic:string;instruction:string;count:number;difficulty:string;output:string}){
  const response=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(input)});
  const data=await response.json();
  if(!response.ok) throw new Error(data.error||"Generation failed.");
  return data as {reviewer:string;terms:{term:string;definition:string}[];questions:StudyQuestion[];cards:{front:string;back:string;topic:string}[];sourceMode:string};
}
export async function askMemora(question:string,context:string){
  const response=await fetch("/api/ask",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question,context})});
  const data=await response.json(); if(!response.ok) throw new Error(data.error||"Could not get an answer."); return data.answer as string;
}
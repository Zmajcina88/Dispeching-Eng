export default async (req) => {
  const json=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
  if(req.method!=="POST")return json({error:"Method not allowed"},405);
  const key=Netlify.env.get("OPENAI_API_KEY"),pass=Netlify.env.get("COACH_ACCESS_CODE");
  if(!key||!pass)return json({error:"AI još nije podešen. Potrebni su OPENAI_API_KEY i COACH_ACCESS_CODE u Netlify podešavanjima."},503);
  if(Number(req.headers.get("content-length")||0)>5000)return json({error:"Preduga poruka."},413);
  let body;try{body=await req.json()}catch{return json({error:"Neispravan zahtev."},400)}
  if(typeof body.code!=="string"||body.code!==pass)return json({error:"Pogrešna pristupna šifra."},401);
  const answer=String(body.answer||"").slice(0,1200).trim(),scenario=String(body.scenario||"").slice(0,350);
  if(answer.length<2)return json({error:"Prvo unesi odgovor."},400);
  try{
    const response=await fetch("https://api.openai.com/v1/chat/completions",{
      method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+key},
      body:JSON.stringify({model:"gpt-4o-mini",max_tokens:300,temperature:0.3,messages:[
        {role:"system",content:"You are Dispatch English Coach for a Serbian beginner learning US trucking dispatching. Respond in Serbian, concise, with: (1) corrected natural English sentence, (2) short explanation in Serbian, (3) one realistic next question in English from a broker or driver. Never claim to assess pronunciation from text. Keep the response under 170 words."},
        {role:"user",content:"Scenario: "+scenario+"\nMy English answer: "+answer}
      ]})
    });
    if(!response.ok){return json({error:response.status===429?"API limit ili kredit je potrošen.":"AI servis trenutno nije dostupan."},502)}
    const data=await response.json();return json({feedback:data.choices?.[0]?.message?.content||"Nema odgovora."});
  }catch{return json({error:"Greška pri povezivanju sa AI servisom."},502)}
};
export const config={rateLimit:{action:"rate_limit",aggregateBy:"ip",windowSize:60,windowLimit:6}};

import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";

const querySchema=z.object({page:z.coerce.number().int().min(1).max(1000).default(1),pageSize:z.coerce.number().int().min(1).max(60).default(24),q:z.string().max(240).default(""),orderBy:z.enum(["-set.releaseDate","number","tcgplayer.prices.holofoil.market","-tcgplayer.prices.holofoil.market"]).default("-set.releaseDate")});
const buckets=new Map<string,{count:number;reset:number}>();
function allowed(ip:string){const now=Date.now(),bucket=buckets.get(ip);if(!bucket||bucket.reset<now){buckets.set(ip,{count:1,reset:now+60000});return true}if(bucket.count>=60)return false;bucket.count++;return true}

export async function GET(request:NextRequest){
  const ip=request.headers.get("x-forwarded-for")?.split(",")[0]||"local";
  if(!allowed(ip))return NextResponse.json({error:"Too many requests"},{status:429,headers:{"Retry-After":"60"}});
  const parsed=querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if(!parsed.success)return NextResponse.json({error:"Invalid card query"},{status:400});
  const {page,pageSize,q,orderBy}=parsed.data;
  const params=new URLSearchParams({page:String(page),pageSize:String(pageSize),orderBy});if(q)params.set("q",q);
  try{const response=await fetch(`https://api.pokemontcg.io/v2/cards?${params}`,{headers:process.env.POKEMONTCG_API_KEY?{"X-Api-Key":process.env.POKEMONTCG_API_KEY}:{},next:{revalidate:900}});if(!response.ok)return NextResponse.json({error:"Card provider unavailable"},{status:502});return NextResponse.json(await response.json(),{headers:{"Cache-Control":"public, s-maxage=900, stale-while-revalidate=86400"}})}catch{return NextResponse.json({error:"Card provider unavailable"},{status:502})}
}

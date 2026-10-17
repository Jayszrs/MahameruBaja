// Original public @mbilasercutting embed media, captured 17 October 2026.
// Pixel files are unchanged. Frames describe whitespace-only presentation crops.
export type SocialPhoto = { src:string; width:number; height:number; frame?:{left:number;top:number;width:number;height:number} };
type Archive = { photos:SocialPhoto[]; first?:number; video?:string; width?:number; height?:number };
const materialFrames = [
  [0,0,1440,1800],[135,170,1170,1461],[345,168,1095,1464],
  [0,169,1095,1463],[129,162,1182,1475],[98,495,1244,756],
  [99,484,1243,831],[0,0,1440,1800],[73,465,1304,870],
];
export const instagramArchive:Record<string,Archive> = {
  DeG2uVRh2uq:{photos:[],video:"/videos/social/DeG2uVRh2uq.mp4",width:640,height:360},
  Dd59WrvhJtC:{photos:[{src:"/images/social/Dd59WrvhJtC.jpg",width:720,height:1280}]},
  Dd5a7EzDk9N:{first:6,photos:materialFrames.map(([left,top,width,height],index)=>({src:`/images/social/Dd5a7EzDk9N-${String(index+1).padStart(2,"0")}.jpg`,width:1440,height:1800,frame:{left,top,width,height}}))},
  Dd3OyLoB_7p:{photos:[{src:"/images/social/Dd3OyLoB_7p.jpg",width:720,height:1280}]},
};
export function originalInstagramMedia(post:{platform:string;url:string;image?:string;videoUrl?:string;displayMode?:string}):Archive|undefined {
  if(post.platform!=="instagram" || post.displayMode==="embed" || post.image || post.videoUrl)return;
  try {
    const url=new URL(post.url);
    if(url.protocol!=="https:" || !["instagram.com","www.instagram.com"].includes(url.hostname))return;
    const code=/^\/(?:p|reel|tv)\/([\w-]+)\/?$/.exec(url.pathname)?.[1];
    return code?instagramArchive[code]:undefined;
  } catch {return;}
}

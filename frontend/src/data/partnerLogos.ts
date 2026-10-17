import { z } from "zod";
import { assetUrl, contentOwner, ownershipFields } from "./divisionCms";
import { clientPartners } from "./clientPartners";
import { supplierPartners } from "./supplierPartners";

export const partnerLogoSchema = z.object({
  ...ownershipFields,
  id:z.string().trim().min(1).max(80), kind:z.enum(["supplier","client"]),
  name:z.string().trim().max(160), logo:assetUrl, published:z.boolean(),
}).superRefine((row,ctx)=>{
  if(row.published && !row.logo)ctx.addIssue({code:z.ZodIssueCode.custom,path:["logo"],message:"Unggah atau isi alamat logo sebelum menerbitkan."});
});
export const partnerLogoListSchema = z.array(partnerLogoSchema).max(100).superRefine((rows,ctx)=>{
  if(new Set(rows.map(row=>row.id)).size!==rows.length)ctx.addIssue({code:z.ZodIssueCode.custom,message:"ID logo harus unik."});
});
export type PartnerLogo = z.infer<typeof partnerLogoSchema>;
// Preserve the existing, supplied company-profile logos. Missing legacy fields
// receive these defaults; an explicitly saved empty list stays empty.
export const defaultPartnerLogos:PartnerLogo[] = [
  ...supplierPartners.map(row=>({...row,id:`supplier-${row.id}`,kind:"supplier" as const,ownerDivision:null,published:true})),
  ...clientPartners.map(row=>({...row,id:`client-${row.name.toLowerCase()}`,kind:"client" as const,ownerDivision:null,published:true})),
];
export function partnerLogosForSite(rows:PartnerLogo[],slug?:string) {
  return rows.filter(row=>row.published && row.logo && (slug ? row.audience ? row.audience.includes(slug) : !contentOwner(row) || contentOwner(row)===slug : !contentOwner(row)));
}
export function movePartnerLogo(rows:PartnerLogo[],id:string,direction:-1|1) {
  const index=rows.findIndex(row=>row.id===id);if(index<0)return rows;
  const positions=rows.flatMap((row,i)=>row.kind===rows[index].kind?[i]:[]);
  const target=positions[positions.indexOf(index)+direction];if(target===undefined)return rows;
  const next=[...rows];[next[index],next[target]]=[next[target],next[index]];return next;
}

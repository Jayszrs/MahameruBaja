import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { websiteWorkspaces } from "../../../../../src/data/adminWebsite";
import { readAdminContent, readAdminArticles } from "../../../../../src/lib/adminWorkspaceData";
import { articleWebsiteTextChoices } from "../../../../../src/lib/articleWebsiteTextCatalog";
import SectionContentEditor from "../../../../../src/components/SectionContentEditor";
import { publicSectionId } from "../../../../../src/data/adminWebsite";
import WebsiteTextEditor from "../../../../../src/components/WebsiteTextEditor";
import Hero from "../../hero/page";
import Promotions from "../../promosi/page";
import Divisions from "../../divisi/page";
import Gallery from "../../galeri/page";
import Inventory from "../../produk/page";
import Articles from "../../artikel/page";
import ContentEditor from "../../../../../src/components/ContentEditor";
import SocialEditor from "../../../../../src/components/SocialEditor";
import Partners from "../../mitra/page";
import Needs from "../../beranda-kebutuhan/page";
import ArticleIntro from "../../../../../src/components/ArticleIntroEditor";
export default async function Page({params,searchParams}:{params:Promise<{page:string}>;searchParams:Promise<{section?:string;mode?:string}>}) {
 const [{page},query]=await Promise.all([params,searchParams]);
 const workspace=websiteWorkspaces.find(row=>row.id===page);if(!workspace)notFound();
 const selected=workspace.sections.find(row=>row.id===query.section)||workspace.sections[0];
 const copy=["copy","section"].includes(selected.editor)||query.mode==="copy";
 const [content,articles]=await Promise.all([readAdminContent(),readAdminArticles()]);
 const editors:Record<string,ReactNode>={hero:<Hero/>,promotions:<Promotions/>,divisions:<Divisions/>,gallery:<Gallery/>,inventory:<Inventory/>,articles:<Articles/>,contacts:<ContentEditor initialContent={content} lockedTab="contacts" embedded/>,social:<SocialEditor initialContent={content} lockedTab={selected.tab as "accounts"|"posts"|undefined} embedded/>,partners:<Partners/>,needs:<Needs/>,articleIntro:<ArticleIntro initialContent={content}/>};
 const href=(id:string,tab?:string,mode?:string)=>`/admin/website/${page}?section=${id}${tab?`&tab=${tab}`:""}${mode?`&mode=${mode}`:""}`;
 return <div className={`admin-website-workspace${selected.editor === "social" || selected.editor === "contacts" || selected.editor === "articles" ? " is-social-editor" : ""}`}><header className="admin-page-heading"><div><h1>{workspace.label}</h1><p>Pilih bagian sesuai urutan tampil di website, dari atas ke bawah.</p></div></header>
 <nav className="admin-section-tabs" aria-label={`Bagian ${workspace.label}`}>{workspace.sections.map((row,index)=><Link href={href(row.id,row.tab)} aria-current={row.id===selected.id?"page":undefined} key={row.id}>{index+1}. {row.label}</Link>)}</nav>
 <header className="admin-section-heading"><div><h2>{selected.label}</h2>{["social","gallery","contacts","partners","divisions"].includes(selected.editor)&&<p>Data ini juga digunakan pada halaman lain. Perubahan mengikuti pemilik dan pengaturan penayangannya.</p>}</div><a href={`${workspace.url}?cms-preview=1${selected.anchor?`#${selected.anchor}`:""}`} target="_blank" rel="noopener noreferrer">Lihat di website</a></header>
 {!["copy","section","articleIntro"].includes(selected.editor)&&<nav className="admin-section-modes" aria-label="Jenis pengeditan"><Link href={href(selected.id,selected.tab)} aria-current={!copy?"page":undefined}>Kelola konten</Link><Link href={href(selected.id,selected.tab,"copy")} aria-current={copy?"page":undefined}>Tulisan, gambar & tautan section</Link></nav>}
 <div key={`${page}-${selected.id}-${copy}`} className="admin-section-editor">{copy&&selected.id==="copy"&&page==="artikel"?<WebsiteTextEditor initialContent={content} articleChoices={articleWebsiteTextChoices(articles)} initialPage="articles" embedded/>:copy?<SectionContentEditor initialContent={content} page={workspace.textPage} section={publicSectionId(workspace,selected)} url={workspace.url}/>:editors[selected.editor]}</div>
 </div>;
}

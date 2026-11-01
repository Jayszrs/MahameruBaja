"use client";

export type WebsiteScopeOption={slug:string;name:string};

export default function WebsiteScopePicker({value,divisions,onChange,disabled=false,className="",label="Website yang diedit",mainLabel="Website utama · Mahameru Baja",allOption}:{value:string;divisions:WebsiteScopeOption[];onChange:(value:string)=>void;disabled?:boolean;className?:string;label?:string;mainLabel?:string;allOption?:{value:string;label:string}}){
  return <label className={`editor-field website-scope-picker ${className}`.trim()}>
    <span className="website-scope-label"><span className="website-scope-icon" aria-hidden="true"><svg viewBox="0 0 20 20" width="18" height="18" fill="none"><path d="M3 17V5.5L10 2l7 3.5V17M1.5 17h17M7 7.5h1m4 0h1M7 10.5h1m4 0h1m-7 3h6V17H7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span>{label}</span></span>
    <select value={value} disabled={disabled} onChange={event=>onChange(event.target.value)}>
      {allOption&&<option value={allOption.value}>{allOption.label}</option>}
      <option value="">{mainLabel}</option>
      {divisions.map(division=><option value={division.slug} key={division.slug}>{division.name}</option>)}
    </select>
  </label>;
}

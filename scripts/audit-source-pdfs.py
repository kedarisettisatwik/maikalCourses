"""Compare website reading payloads against independent extraction of every PDF.
Run from repository root after node scripts/export-source-audit.cjs.
Uses PDFium for page readers and pdfplumber for legacy reflowed transcriptions.
"""
import json,re,hashlib,sys
from pathlib import Path
import pypdfium2 as pdfium
import pdfplumber
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'tmp/audit-readings.json').read_text(encoding='utf-8'))
paths={'oops':('OOPS','OOPS.pdf'),'system-design':('systemDesign','System_Design.pdf'),'computer-networks':('ComputerNetworks','CN.pdf'),'dbms':('DBMS','DBMS.pdf'),'operating-systems':('OperatingSystems','op sys.pdf'),'devops':('devOps','DevOps.pdf'),'react':('React js','react.pdf'),'jsp':('javaScript','JavaScript .pdf')}
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def norm(s):return re.sub(r'\s+','',s.replace('\r','').replace('\ufffe','').replace('\ue062','Th').replace('\ue0bb','Th').replace('\ue09d','ft'))
report={'method':'Independent PDF extraction compared with complete website transcripts; exact normalized text equality, original PDF SHA-256 equality, contiguous source ranges, every page image present. Front matter remains available in the original PDF.','courses':[]}
for course in data:
 cid=course['id'];folder,file=paths[cid];supplied=ROOT.parent/folder/file;assert digest(supplied)==digest(ROOT/course['pdf']),cid+' PDF differs';doc=pdfium.PdfDocument(str(supplied));texts=[]
 if cid in ['oops','system-design']:
  with pdfplumber.open(supplied) as pdf:
   texts=[p.extract_text(x_tolerance=2,y_tolerance=3) or '' for p in pdf.pages]
 else:
  for page in doc:
   t=page.get_textpage();texts.append(t.get_text_range());t.close();page.close()
 entries=course['chapters'];nextpage=entries[0]['start'];checks=[]
 for c in entries:
  assert c['start']==nextpage,(cid,c['id'],'gap');nextpage=c['end']+1;r=c['reading'];source=texts[c['start']-1:c['end']]
  if cid=='oops':
   actual=r['fullText']
  else:actual='\n\n'.join(s['body'] for s in r['sections'] if not s['body'].startswith('This source page contains no extractable text.'))
  expected='\n\n'.join(source)
  if norm(actual)!=norm(expected):
   a,b=norm(actual),norm(expected);index=next((i for i,(x,y) in enumerate(zip(a,b)) if x!=y),min(len(a),len(b)));raise AssertionError((cid,c['id'],'text mismatch',len(a),len(b),index,ascii(a[max(0,index-30):index+90]),ascii(b[max(0,index-30):index+90])))
  pages=r['pages'];assert len(pages)==c['end']-c['start']+1
  for image in pages:assert (ROOT/image).is_file(),image
  checks.append({'id':c['id'],'title':c['title'],'start':c['start'],'end':c['end'],'textMatch':True,'textSHA256':hashlib.sha256(norm(expected).encode()).hexdigest()})
 # Bookmarks form a second, independent chapter inventory for the five textbooks.
 titles=[]
 for b in doc.get_toc():
  title=b.get_title();take=False
  if cid in ['computer-networks','jsp']:take=b.level==0 and bool(re.match(r'^\d+\s',title))
  elif cid in ['dbms','operating-systems','react']:take=bool(re.match(r'^Chapter \d+ ',title))
  elif cid=='devops':take=bool(re.match(r'^\d+\. ',title))
  if take:
   page=b.get_dest().get_index()+1;assert any(c['start']==page for c in entries),(cid,title,page,'missing chapter');entry=next(c for c in entries if c['start']==page);canonical=lambda value:re.sub(r'[^a-z0-9]','',re.sub(r'^(?:Chapter )?\d+[. :]+','',value,flags=re.I).lower());assert canonical(title)==canonical(entry['title']),(cid,title,entry['title'],'chapter title differs');titles.append(title)
 if cid=='oops':
  titles=[]
  for c in entries:
   assert re.search(r'Unit\s+'+str(c['id'])+r'\s*:',texts[c['start']-1]),('OOPS unit heading',c['id'])
   titles.append(c['title'])
 if cid=='system-design':
  from pypdf import PdfReader
  import logging
  logging.getLogger('pypdf').setLevel(logging.ERROR)
  reader=PdfReader(supplied);detected=[]
  for i,page in enumerate(reader.pages):
   bits=[]
   page.extract_text(visitor_text=lambda t,cm,tm,f,size:bits.append(t) if size>20 and t.strip() else None)
   if i>=7 and bits:detected.append(i+1)
  for exception in [162,238]:
   assert entries[[c['start'] for c in entries].index(exception)]['title'].split('?')[0].lower() in re.sub(r'\s+',' ',texts[exception-1]).lower()
   if exception not in detected:detected.append(exception)
  assert sorted(detected)==[c['start'] for c in entries],('System Design article inventory differs',detected)
  titles=[c['title'] for c in entries]
 expected_counts={'oops':14,'system-design':189,'computer-networks':9,'dbms':30,'operating-systems':20,'devops':28,'react':20,'jsp':21}
 assert len(titles)==expected_counts[cid],(cid,'chapter inventory',len(titles))
 result={'id':cid,'pdfPages':len(doc),'sourceEntries':len(entries),'chapterHeadingsVerified':len(titles) if titles else None,'start':entries[0]['start'],'end':entries[-1]['end'],'pageImages':sum(c['end']-c['start']+1 for c in entries),'pdfSHA256':digest(supplied),'textMatch':True,'chapters':checks}
 report['courses'].append(result);print(cid,'PASS',len(checks),'source entries, exact complete transcript match,',result['pageImages'],'page images;',len(titles),'chapter headings',flush=True);doc.close()
(ROOT/'courses/source-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
summary={c['id']:{k:v for k,v in c.items() if k not in ['chapters','pdfSHA256']} for c in report['courses']}
(ROOT/'courses/source-audit-summary.js').write_text('/* Generated by the independent PDF audit. */\nwindow.SOURCE_AUDIT='+json.dumps(summary,ensure_ascii=False)+';\n',encoding='utf-8')
print('ALL SOURCE COMPARISONS PASSED',flush=True)

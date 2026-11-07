from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
SPECS=[('computer-networks','ComputerNetworks','Computer Networks','Networks','Fifth edition', ['Connect the layers.','Explain the packet.']),('dbms','DBMS','DBMS','Databases','Sixth edition',['Model the data.','Protect the invariants.']),('operating-systems','OperatingSystems','Operating Systems','Operating systems','Ninth edition',['Follow the process.','Understand the machine.']),('devops','devOps','DevOps','Delivery engineering','Engineering DevOps / 2019',['Engineer the flow.','Operate with confidence.'])]
for slug,folder,title,language,edition,hero in SPECS:
    original=json.loads((ROOT.parent/folder/'course.json').read_text(encoding='utf-8'))
    directory=ROOT/'courses'/slug;directory.mkdir(parents=True,exist_ok=True)
    chapters=[]
    for source in original['chapters']:
        c={k:v for k,v in source.items() if k!='text'}
        chapters.append(c)
        texts=json.loads((ROOT.parent/folder/'pages.json').read_text(encoding='utf-8'))
        sections=[]
        # Every supplied page is included once in the reader; scans preserve formulas,
        # diagrams, code, tables, and ligatures that extraction cannot faithfully reflow.
        for page in range(c['page'],c['end']+1):
            text=texts[page-1].replace('\r','').replace('\ufffe','').replace('\ue062','Th').replace('\ue0bb','Th').replace('\ue09d','ft')
            sections.append({'title':'Source PDF page '+str(page),'body':text or 'This source page contains no extractable text. Read its original page image for figures and other content.'})
        images=['assets/'+slug+'/pages/page-'+str(page).zfill(4)+'.webp' for page in range(c['page'],c['end']+1)]
        reading={'start':c['page'],'end':c['end'],'sections':sections,'contents':[{'number':'','title':s['title']} for s in c['sections']], 'pages':images,'originalKeywords':False,'glossary':''}
        payload='/* Complete source range '+str(c['page'])+'-'+str(c['end'])+'. */\n(()=>{const course=window.COURSES.find(c=>c.id==='+json.dumps(slug)+');const chapter=course.chapters.find(c=>c.id==='+str(c['id'])+');chapter.reading='+json.dumps(reading,ensure_ascii=False)+';chapter.reading.terms=chapter.terms;chapter.reading.glossary=chapter.terms.map(t=>t[0]+": "+t[1]).join("\\n\\n");})();\n'
        (directory/f'reading-{c["id"]}.js').write_text(payload,encoding='utf-8')
    unavailable=[]
    if slug=='dbms':unavailable=['Appendix B: Advanced Relational Design (online-only; absent from supplied PDF)','Appendix C: Other Relational Query Languages (online-only; absent from supplied PDF)','Appendix D: Network Model (online-only; absent from supplied PDF)','Appendix E: Hierarchical Model (online-only; absent from supplied PDF)']
    if slug=='operating-systems':unavailable=['Appendix A: BSD UNIX (online-only; absent from supplied PDF)','Appendix B: The Mach System (online-only; absent from supplied PDF)']
    meta={'id':slug,'title':title,'shortTitle':title+' Studio','bookTitle':title,'bookSubtitle':language+' / complete textbook companion','language':language,'edition':edition,'heroTitle':hero,'heroDescription':'Follow every supplied chapter, original diagram, definition, worked example, and book-wide interview question.','description':'Complete supplied textbook readings, original diagrams, guided explanations, and interview practice.','attribution':original['attribution'],'pdfPages':original['pdfPages'],'chapters':chapters,'unavailableAppendices':unavailable,'definitionsLabel':'Companion definitions'}
    (ROOT/'courses'/f'{slug}.js').write_text('/* Metadata and guided chapters; full readings load per chapter. */\nwindow.registerTextbook('+json.dumps(meta,ensure_ascii=False)+');\n',encoding='utf-8')
    coverage={'id':slug,'pdfPages':original['pdfPages'],'sourceStart':chapters[0]['page'],'sourceEnd':chapters[-1]['end'],'sourceEntries':len(chapters),'numberedChapters':9 if slug=='computer-networks' else 30 if slug=='dbms' else 20 if slug=='operating-systems' else 28,'chapters':[{k:c[k] for k in ['id','title','page','end']} for c in chapters],'unavailableAppendices':unavailable}
    (ROOT/'courses'/f'{slug}-coverage.json').write_text(json.dumps(coverage,ensure_ascii=False,indent=2),encoding='utf-8')
    print(slug,len(chapters),'source entries;',sum(c['end']-c['page']+1 for c in chapters),'source pages; Interview appended at runtime.')

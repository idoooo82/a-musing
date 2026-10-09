import json
T=[]
for ln in open('audio/word_timings.txt',encoding='utf-8'):
    if ln.startswith('#') or not ln.strip(): continue
    a,b,w=ln.strip().split('\t'); T.append((float(a),float(b),w))
assert len(T)==140,len(T)
# display lines: (text, list of timing indices per displayed word)
R=lambda a,b: list(range(a,b+1))
D=[
 ("פלוטו, הכוכב שביטלו אותו", R(0,3), 'cover'),
 ("פעם הוא היה כוכב, ואף אחד לא דרך עליו", R(4,12), None),
 ("אבל אז איזה אסטרונום, איזה פירור קיום", R(13,19), None),
 ("בקצה של חור ביקום,", R(20,23), None),
 ("החליט שלא יהיה ולא יקום, שמשהו במציאות עקום.", R(24,31), None),
 ("ומהיום, מכובדי, פלוטו לא כוכב, מספיק ודי.", R(32,38), None),
 ("הוא לא בגודל המתאים,", R(39,42), None),
 ("הוא לא כבד מספיק, וקצת רזה,", R(43,48), None),
 ("וזה סופי, פלוטו הוא מתחזה.", R(49,53), None),
 ("ופלוטו, שככה פתאום ביטלו אותו,", R(54,58), None),
 ("נשאר לרגע בלי חמצן. איך הפך מכוכב לליצן?", R(59,66), None),
 ("הוא לא נרגע, כולו כואב, וסביב עצמו הוא מסתובב.", [67,68,69,70,73,74,75,76,77], None),
 ("טוב, בסדר, בסוף הוא נרגע,", R(78,82), None),
 ("כי עמוק בפנים הוא כבר ידע", [83,84,85,87,88,89], None),
 ("שאף אחד עליו לא קובע, ובטח שלא מחליט.", R(90,97), None),
 ("הוא לא סתם כוכב, הוא כוכב שביט!", R(98,104), None),
 ("כי מה שפלוטו יודע, וכדאי גם לכם, ילדים,", R(105,112), None),
 ("שאתם כוכבים רק בזכותכם,", R(113,116), None),
 ("ומי שכוכב, לנצח יזרח.", R(117,120), None),
 ("ואם אומרים לו שהוא לא כל כך,", R(121,127), None),
 ("הוא לא נעלב, כי הוא כמו פלוטו:", R(128,134), None),
 ("קטן, אבל כולו זהב.", [135,136,137,139], None),
]
EMPH={'שביט!':'gold','זהב.':'gold','ילדים,':'warm','כוכבים':'warm'}
out=[]
for text,idx,tag in D:
    ws=text.split(' '); assert len(ws)==len(idx),(text,len(ws),len(idx))
    words=[]
    for k,(w,i) in enumerate(zip(ws,idx)):
        s=T[i][0]; e=T[idx[k+1]][0] if k+1<len(idx) else T[i][1]
        if k+1<len(idx): e=min(e,T[i][1]+0.05) if T[i][1]<e else e
        words.append({'w':w,'s':round(s,2),'e':round(max(e,s+0.1),2),'c':EMPH.get(w)})
    out.append({'text':text,'s':words[0]['s'],'e':words[-1]['e'],'words':words,'tag':tag})
open('lines.js','w',encoding='utf-8').write('window.LINES='+json.dumps(out,ensure_ascii=False,indent=0)+';\n')
json.dump(out,open('audio/lines.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
for o in out: print(f"{o['s']:6.2f}-{o['e']:6.2f} {o['text']}")

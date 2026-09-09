#!/usr/bin/env python3
"""Mirror dist/ to a remote directory over explicit FTPS (used by deploy.sh when lftp is absent).
Env: DEPLOY_HOST, DEPLOY_USER, DEPLOY_PASS, DEPLOY_PATH, DEPLOY_VERIFY_CERT (yes|no), DEPLOY_PORT (21)."""
import ftplib, os, ssl, sys, posixpath
host=os.environ['DEPLOY_HOST']; user=os.environ['DEPLOY_USER']; pw=os.environ['DEPLOY_PASS']
root=os.environ.get('DEPLOY_PATH','public_html').strip('/'); port=int(os.environ.get('DEPLOY_PORT','21'))
verify=os.environ.get('DEPLOY_VERIFY_CERT','yes').lower()!='no'
KEEP={'cgi-bin','.well-known'}          # remote entries never deleted
local=os.path.join(os.path.dirname(os.path.abspath(__file__)),'dist')

ctx=ssl.create_default_context()
if not verify: ctx.check_hostname=False; ctx.verify_mode=ssl.CERT_NONE
f=ftplib.FTP_TLS(context=ctx); f.connect(host,port,timeout=60); f.auth(); f.login(user,pw); f.prot_p(); f.set_pasv(True)

def remote_tree(path):
    """Return {relpath: 'd'|'f'} under path using MLSD."""
    out={}
    def walk(p, rel):
        try: entries=list(f.mlsd(p, facts=['type']))
        except ftplib.error_perm: return
        for name,facts in entries:
            if name in ('.','..'): continue
            r=posixpath.join(rel,name) if rel else name
            if facts.get('type')=='dir': out[r]='d'; walk(posixpath.join(p,name), r)
            else: out[r]='f'
    walk(path,''); return out

def ensure_dir(p):
    try: f.mkd(p)
    except ftplib.error_perm: pass

ensure_dir(root)
existing=remote_tree(root)
uploaded=0; wanted=set()
for dirpath,dirnames,filenames in os.walk(local):
    rel=os.path.relpath(dirpath,local).replace(os.sep,'/'); rel='' if rel=='.' else rel
    for d in dirnames:
        rd=posixpath.join(rel,d) if rel else d; wanted.add(rd); ensure_dir(posixpath.join(root,rd))
    for fn in filenames:
        rf=posixpath.join(rel,fn) if rel else fn; wanted.add(rf)
        with open(os.path.join(dirpath,fn),'rb') as fh: f.storbinary('STOR '+posixpath.join(root,rf), fh)
        uploaded+=1
# delete stale remote files/dirs (deepest first), never inside KEEP
stale=[r for r in existing if r not in wanted and r.split('/')[0] not in KEEP]
deleted=0
for r in sorted((r for r in stale if existing[r]=='f'), key=len, reverse=True):
    try: f.delete(posixpath.join(root,r)); deleted+=1
    except ftplib.error_perm as e: print('keep', r, e)
for r in sorted((r for r in stale if existing[r]=='d'), key=len, reverse=True):
    try: f.rmd(posixpath.join(root,r)); deleted+=1
    except ftplib.error_perm: pass
f.quit()
print(f'uploaded {uploaded} files, removed {deleted} stale entries, root={root}')

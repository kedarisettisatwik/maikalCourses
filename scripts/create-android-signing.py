from pathlib import Path
import secrets,subprocess,os,shutil
folder=Path('android/signing');folder.mkdir(parents=True,exist_ok=True);key=folder/'maikal-release.keystore'
if not key.exists():
 password=secrets.token_hex(32)
 env=os.environ.copy();env['MAIKAL_RELEASE_PASSWORD']=password
 keytool=shutil.which('keytool') or str(Path(os.environ.get('JAVA_HOME',''))/'bin'/'keytool.exe')
 result=subprocess.run([keytool,'-genkeypair','-keystore',str(key),'-storepass:env','MAIKAL_RELEASE_PASSWORD','-keypass:env','MAIKAL_RELEASE_PASSWORD','-alias','maikal','-keyalg','RSA','-keysize','3072','-validity','10000','-dname','CN=Maikal Courses, O=Maikal Courses, C=IN'],env=env,capture_output=True,text=True)
 if result.returncode:raise RuntimeError('Could not create release key')
 (folder/'signing.properties').write_text('storePassword='+password+'\nkeyPassword='+password+'\n',encoding='utf-8')
print('Release signing material is stored locally in the ignored android/signing directory. Keep it private for future app updates.')

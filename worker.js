const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-key",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};
const json = (data, status=200) => new Response(JSON.stringify(data), {status, headers:{"content-type":"application/json; charset=utf-8", ...cors}});
function ok(request, env) { return true; }
async function init(env){
 await env.DB.prepare(`CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',image_url TEXT NOT NULL DEFAULT '',price INTEGER NOT NULL DEFAULT 0,old_price INTEGER NOT NULL DEFAULT 0,wholesale_price INTEGER NOT NULL DEFAULT 0,category TEXT NOT NULL DEFAULT 'الزرع والنباتات',hot_offer INTEGER NOT NULL DEFAULT 0,discount INTEGER NOT NULL DEFAULT 0,featured INTEGER NOT NULL DEFAULT 0,new_product INTEGER NOT NULL DEFAULT 0,sort_order INTEGER NOT NULL DEFAULT 0,stock INTEGER NOT NULL DEFAULT 0,max_qty INTEGER NOT NULL DEFAULT 99,active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
 const cols=[['wholesale_price','INTEGER NOT NULL DEFAULT 0'],['category',"TEXT NOT NULL DEFAULT 'الزرع والنباتات'"],['hot_offer','INTEGER NOT NULL DEFAULT 0'],['discount','INTEGER NOT NULL DEFAULT 0'],['featured','INTEGER NOT NULL DEFAULT 0'],['new_product','INTEGER NOT NULL DEFAULT 0'],['sort_order','INTEGER NOT NULL DEFAULT 0']];
 for(const [c,t] of cols){try{await env.DB.prepare(`ALTER TABLE products ADD COLUMN ${c} ${t}`).run()}catch(e){if(!String(e.message||e).toLowerCase().includes('duplicate column'))throw e}}
 await env.DB.prepare(`CREATE TABLE IF NOT EXISTS store_settings (id INTEGER PRIMARY KEY CHECK(id=1),store_name TEXT NOT NULL DEFAULT 'Green Moon Plants and Flowers',store_desc TEXT NOT NULL DEFAULT '',profile_url TEXT NOT NULL DEFAULT '',cover_url TEXT NOT NULL DEFAULT '',style TEXT NOT NULL DEFAULT 'luxury-emerald',updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`).run();
 await env.DB.prepare(`INSERT OR IGNORE INTO store_settings(id) VALUES(1)`).run();
 const count=await env.DB.prepare('SELECT COUNT(*) AS n FROM products').first();
 if(Number(count?.n||0)===0){
  const seed=[
   ['بامبو كيرلي','https://catalog.greenmoon-eg.workers.dev/assets/p_bamboo_curly.jpg',849,'الزرع والنباتات',1,0,1,0,1,99,99],
   ['بامبو بوتس','https://catalog.greenmoon-eg.workers.dev/assets/p_bamboo_pothos.jpg',699,'الزرع والنباتات',1,0,1,0,2,99,99],
   ['بوتس جولدن','https://catalog.greenmoon-eg.workers.dev/assets/p_pothos_gold.jpg',499,'الزرع والنباتات',0,0,0,1,3,99,99],
   ['مونستيرا','https://catalog.greenmoon-eg.workers.dev/assets/p_monstera.jpg',699,'الزرع والنباتات',1,0,1,1,4,99,99],
   ['فازة زجاجية','https://catalog.greenmoon-eg.workers.dev/assets/p_vase.jpg',250,'الفازات',0,0,0,0,5,99,99],
   ['حجارة زينة ملونة','https://catalog.greenmoon-eg.workers.dev/assets/p_stones.jpg',40,'إكسسوارات الزينة',0,0,0,0,6,99,99]
  ];
  for(const p of seed) await env.DB.prepare('INSERT INTO products(name,image_url,price,category,featured,discount,hot_offer,new_product,sort_order,stock,max_qty,active) VALUES(?,?,?,?,?,?,?,?,?,?,?,1)').bind(...p).run();
 }
}

const ADMIN_HTML = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Green Moon — لوحة التحكم</title><style>
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Tahoma,Arial;background:#f4f6f3;color:#17382d}header{background:#0a392b;color:#fff;padding:16px;position:sticky;top:0;z-index:5}.wrap{max-width:980px;margin:auto;padding:14px}h1{margin:0;font-size:21px}.tabs{display:flex;gap:8px;overflow:auto;margin:12px 0}.tabs button{white-space:nowrap}.card{background:#fff;border-radius:16px;padding:16px;margin:12px 0;box-shadow:0 4px 18px #0000000d}label{display:block;font-weight:800;margin:9px 0 5px}input,textarea,select,button{font:inherit}input,textarea,select{width:100%;padding:11px;border:1px solid #d6ded9;border-radius:10px;background:#fff}textarea{min-height:85px}.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.checks{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.checks label{background:#f5f8f5;padding:10px;border-radius:10px;margin:0}.checks input{width:auto}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}button{border:0;border-radius:10px;padding:11px 14px;cursor:pointer}.primary{background:#0a392b;color:#fff}.muted{background:#edf1ee}.danger{background:#b42318;color:#fff}.hide{display:none!important}.item{display:flex;gap:12px;align-items:center;border-top:1px solid #eee;padding:12px 0}.item img{width:74px;height:74px;object-fit:cover;border-radius:11px;background:#eee}.small{font-size:13px;color:#66736d}.badge{display:inline-block;background:#e9f4ee;border-radius:20px;padding:3px 8px;font-size:11px;margin:2px}.styleGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.style{border:2px solid #e3e8e4;border-radius:15px;padding:12px;cursor:pointer}.style.active{border-color:#0a392b}.swatches{display:flex;height:55px;border-radius:10px;overflow:hidden;margin-bottom:8px}.swatches i{flex:1}.preview{max-width:150px;max-height:100px;border-radius:10px;margin-top:8px}.status{padding:10px;border-radius:10px;background:#edf7f0;margin-bottom:10px;display:none}.hint{font-size:12px;color:#68736d}.login{max-width:420px;margin:60px auto}@media(max-width:600px){.row,.styleGrid{grid-template-columns:1fr}}
</style></head><body><header><div class="wrap"><h1>🌿 Green Moon — لوحة التحكم</h1></div></header><main class="wrap">
<section id="app"><div id="status" class="status"></div><div class="tabs"><button class="primary" onclick="showTab('products')">🌿 المنتجات</button><button class="muted" onclick="showTab('store')">🎨 مظهر المتجر</button></div>
<div id="productsTab"><div class="card"><h2 id="formTitle">إضافة منتج</h2><input id="id" type="hidden"><label>اسم المنتج</label><input id="name" placeholder="مثال: بامبو كيرلي 90 سم"><label>صورة المنتج</label><input id="image" type="file" accept="image/*" onchange="previewImage()"><img id="preview" class="preview"><div class="hint">رفع الصورة يحتاج R2 مربوطًا باسم IMAGES. ويمكنك مؤقتًا إدخال رابط الصورة من خانة الصورة الحالية عند التعديل.</div><label>رابط الصورة الحالي (اختياري)</label><input id="image_url" placeholder="https://..."><div class="row"><div><label>سعر الجملة 🔐</label><input id="wholesale_price" type="number"></div><div><label>السعر قبل الخصم</label><input id="old_price" type="number"></div></div><label>السعر بعد الخصم / السعر الحالي</label><input id="price" type="number"><div class="row"><div><label>القسم</label><select id="category"><option>الزرع والنباتات</option><option>الأصص والمزهريات</option><option>الأسمدة والمستلزمات</option><option>الأحجار والزينة</option><option>الهدايا والباقات</option><option>أخرى</option></select></div><div><label>المخزون</label><input id="stock" type="number"></div></div><div class="checks"><label><input id="hot_offer" type="checkbox"> 🔥 عرض ساخن</label><label><input id="discount" type="checkbox"> 🏷️ تخفيض</label><label><input id="featured" type="checkbox"> ⭐ مميز</label><label><input id="new_product" type="checkbox"> 🆕 جديد</label></div><label>ترتيب المنتج</label><input id="sort_order" type="number" value="0"><label>أقصى كمية للطلب</label><input id="max_qty" type="number" value="99"><label>الوصف</label><textarea id="description"></textarea><div class="actions"><button class="primary" onclick="save()">حفظ المنتج</button><button class="muted" onclick="clearForm()">إضافة جديد</button><button class="muted" onclick="load()">تحديث</button></div></div><div class="card"><h2>المنتجات</h2><div id="list">جاري التحميل...</div></div></div>
<div id="storeTab" class="hide"><div class="card"><h2>🎨 هوية المتجر</h2><label>اسم المتجر</label><input id="store_name"><label>وصف المتجر</label><textarea id="store_desc"></textarea><label>صورة البروفايل / اللوجو</label><input id="profile_file" type="file" accept="image/*" onchange="previewStoreImage('profile_file','profile_preview')"><img id="profile_preview" class="preview"><label>صورة الغلاف</label><input id="cover_file" type="file" accept="image/*" onchange="previewStoreImage('cover_file','cover_preview')"><img id="cover_preview" class="preview"><input id="profile_url" type="hidden"><input id="cover_url" type="hidden"><div class="actions"><button class="primary" onclick="saveSettings()">حفظ الهوية</button></div></div><div class="card"><h2>👑 اختر الاستايل</h2><div class="styleGrid" id="styleGrid"></div><div class="actions"><button class="primary" onclick="saveSettings()">تفعيل الاستايل المختار</button></div></div></div>
</section></main><script>let currentImage='',settings={},selectedStyle='luxury-emerald',productsCache=[];
const $=id=>document.getElementById(id);
function msg(t){const el=$('status');if(!el)return;el.textContent=t;el.style.display='block';clearTimeout(window._msgTimer);window._msgTimer=setTimeout(()=>el.style.display='none',3500)}
async function api(url,opt={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),10000);
  const headers=new Headers(opt.headers||{});
  if(opt.body && typeof opt.body==='string' && !headers.has('content-type')) headers.set('content-type','application/json');
  try{
    const r=await fetch(url,{...opt,headers,signal:controller.signal,cache:'no-store'});
    const text=await r.text();
    let d={};
    try{d=text?JSON.parse(text):{}}catch(_){throw Error('استجابة غير صالحة من الخادم')}
    if(!r.ok)throw Error(d.error||('خطأ HTTP '+r.status));
    return d;
  }catch(e){
    if(e && e.name==='AbortError') throw Error('انتهت مهلة الاتصال بالخادم');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
function showTab(t){$('productsTab').classList.toggle('hide',t!=='products');$('storeTab').classList.toggle('hide',t!=='store')}
function previewImage(){const f=$('image').files?.[0];if(!f)return;$('preview').src=URL.createObjectURL(f);$('preview').style.display='block'}
function previewStoreImage(inputId,previewId){const f=$(inputId).files?.[0];if(!f)return;$(previewId).src=URL.createObjectURL(f);$(previewId).style.display='block'}
async function compressImage(file,maxSide=1200,quality=.78){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{const scale=Math.min(1,maxSide/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*scale));c.height=Math.max(1,Math.round(im.height*scale));c.getContext('2d').drawImage(im,0,0,c.width,c.height);c.toBlob(b=>b?resolve(b):reject(Error('تعذر تجهيز الصورة')),'image/jpeg',quality)};im.onerror=()=>reject(Error('الصورة غير صالحة'));im.src=URL.createObjectURL(file)})}
async function uploadImage(){const f=$('image').files?.[0];if(!f)return currentImage;const blob=await compressImage(f,1000,.76);const fd=new FormData();fd.append('image',blob,'product.jpg');const d=await api('/api/admin/upload',{method:'POST',body:fd});return d.url}
async function uploadStoreFile(inputId){const f=$(inputId).files?.[0];if(!f)return '';const blob=await compressImage(f,1400,.76);const fd=new FormData();fd.append('image',blob,'store.jpg');const d=await api('/api/admin/upload',{method:'POST',body:fd});return d.url}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function productUrl(id){return 'https://catalog.greenmoon-eg.workers.dev/product/'+encodeURIComponent(id)}
function bindServerButtons(){
 const box=$('list');if(!box)return;
}
async function copyProductLink(id){
 const url=productUrl(id);
 try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(url);msg('تم نسخ رابط المنتج ✅');return}}catch(e){}
 try{const ta=document.createElement('textarea');ta.value=url;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();ta.setSelectionRange(0,ta.value.length);const ok=document.execCommand('copy');ta.remove();if(ok){msg('تم نسخ رابط المنتج ✅');return}}catch(e){}
 window.prompt('انسخ رابط المنتج:',url);
}
async function save(){
 try{
  const id=$('id').value; let image_url=$('image_url').value.trim()||currentImage;
  if($('image').files?.[0]) image_url=await uploadImage();
  const b={name:$('name').value.trim(),description:$('description').value,image_url,price:Number($('price').value)||0,old_price:Number($('old_price').value)||0,wholesale_price:Number($('wholesale_price').value)||0,category:$('category').value,hot_offer:$('hot_offer').checked,discount:$('discount').checked,featured:$('featured').checked,new_product:$('new_product').checked,sort_order:Number($('sort_order').value)||0,stock:Math.max(0,Number($('stock').value)||0),max_qty:Math.max(1,Number($('max_qty').value)||99)};
  if(!b.name)throw Error('اسم المنتج مطلوب');
  await api(id?('/api/admin/products/'+id):'/api/admin/products',{method:id?'PUT':'POST',body:JSON.stringify(b)});
  msg('تم حفظ المنتج بنجاح ✅'); clearForm(); await load();
 }catch(e){msg(e.message);console.error(e)}
}
function edit(p){
 $('id').value=p.id;$('name').value=p.name||'';$('price').value=p.price??0;$('old_price').value=p.old_price??0;$('wholesale_price').value=p.wholesale_price??0;$('category').value=p.category||'الزرع والنباتات';$('hot_offer').checked=!!p.hot_offer;$('discount').checked=!!p.discount;$('featured').checked=!!p.featured;$('new_product').checked=!!p.new_product;$('sort_order').value=p.sort_order??0;$('stock').value=p.stock??0;$('max_qty').value=p.max_qty??99;$('description').value=p.description||'';currentImage=p.image_url||'';$('image_url').value=currentImage;$('image').value='';$('preview').style.display=currentImage?'block':'none';$('preview').src=currentImage;$('formTitle').textContent='تعديل المنتج';showTab('products');window.scrollTo({top:0,behavior:'smooth'});
}
function clearForm(){['id','name','price','old_price','wholesale_price','stock','description','image_url'].forEach(x=>$(x).value='');$('sort_order').value=0;$('max_qty').value=99;$('category').value='الزرع والنباتات';['hot_offer','discount','featured','new_product'].forEach(x=>$(x).checked=false);$('image').value='';$('preview').style.display='none';currentImage='';$('formTitle').textContent='إضافة منتج'}
function renderProducts(list){
 productsCache=list||[];
 const box=$('list');
 if(!productsCache.length){box.innerHTML='<div class="small">لا توجد منتجات بعد.</div>';return}
 box.innerHTML=productsCache.map((p,i)=>'<div class="item"><img src="'+esc(p.image_url||'')+'"><div style="flex:1"><b>'+esc(p.name)+'</b><div class="small">بيع: '+(Number(p.price)||0)+' ج • جملة: '+(Number(p.wholesale_price)||0)+' ج • مخزون: '+(Number(p.stock)||0)+'</div><div>'+(p.hot_offer?'<span class="badge">🔥 عرض ساخن</span>':'')+(p.discount?'<span class="badge">🏷️ تخفيض</span>':'')+(p.featured?'<span class="badge">⭐ مميز</span>':'')+(p.new_product?'<span class="badge">🆕 جديد</span>':'')+'</div><div class="actions"><button class="muted" data-action="edit" data-index="'+i+'" type="button">تعديل</button><button class="muted" data-action="copy" data-id="'+p.id+'" type="button">🔗 نسخ الرابط</button><button class="danger" data-action="hide" data-id="'+p.id+'" type="button">إخفاء</button></div></div></div>').join('');
}
document.addEventListener('click',e=>{const b=e.target.closest('#list button[data-action]');if(!b)return;const a=b.dataset.action;if(a==='edit'){const p=productsCache[Number(b.dataset.index)];if(p)edit(p)}else if(a==='copy'){copyProductLink(Number(b.dataset.id))}else if(a==='hide'){removeP(Number(b.dataset.id))}});
async function load(){
 const box=$('list');box.innerHTML='<div class="small">جاري تحميل المنتجات…</div>';
 try{const d=await api('/api/products');if(!d||!Array.isArray(d.products))throw Error('بيانات المنتجات غير صحيحة');renderProducts(d.products);msg('تم تحميل '+d.products.length+' منتج ✅')}
 catch(e){box.innerHTML='<div style="color:#b42318;font-weight:800">تعذر تحميل المنتجات: '+esc(e.message)+'</div><div class="actions"><button class="primary" id="retryBtn">إعادة المحاولة</button></div>';$('retryBtn').onclick=load;console.error(e)}
}
async function removeP(id){if(!confirm('إخفاء المنتج؟'))return;try{await api('/api/admin/products/'+id,{method:'DELETE'});msg('تم إخفاء المنتج');await load()}catch(e){msg(e.message)}}
const styles=[['luxury-emerald','Luxury Emerald',['#073b2a','#c9a227','#f5f0df']],['black-gold','Black & Gold',['#111','#c8a64b','#f7f3e8']],['botanical-cream','Botanical Cream',['#f6f0df','#315c45','#fff']],['forest-premium','Forest Premium',['#123d2d','#d7c59a','#eef0e8']],['royal-green','Royal Green',['#0d513b','#d4af37','#fff']],['minimal-nature','Minimal Nature',['#fff','#315d46','#e9eee8']],['dark-botanical','Dark Botanical',['#071f18','#8abf9b','#172e25']],['modern-glass','Modern Glass',['#102c25','#79a995','#edf6f2']],['luxury-boutique','Luxury Boutique',['#1d3128','#b99a5b','#efe8da']],['editorial-garden','Editorial Garden',['#24352b','#d5b978','#f4f1e7']]];
function renderStyles(){$('styleGrid').innerHTML=styles.map(s=>'<div class="style '+(selectedStyle===s[0]?'active':'')+'" data-style="'+s[0]+'"><div class="swatches">'+s[2].map(c=>'<i style="background:'+c+'"></i>').join('')+'</div><b>'+s[1]+'</b></div>').join('');$('styleGrid').querySelectorAll('[data-style]').forEach(el=>el.onclick=()=>{selectedStyle=el.dataset.style;renderStyles()})}
async function loadSettings(){try{const d=await api('/api/store');settings=d.settings||{};$('store_name').value=settings.store_name||'Green Moon Plants and Flowers';$('store_desc').value=settings.store_desc||'';$('profile_url').value=settings.profile_url||'';$('cover_url').value=settings.cover_url||'';if(settings.profile_url){$('profile_preview').src=settings.profile_url;$('profile_preview').style.display='block'}if(settings.cover_url){$('cover_preview').src=settings.cover_url;$('cover_preview').style.display='block'}selectedStyle=settings.style||'luxury-emerald';renderStyles()}catch(e){msg('تعذر تحميل إعدادات المتجر: '+e.message)}}
async function saveSettings(){try{let profile_url=$('profile_url').value.trim(),cover_url=$('cover_url').value.trim();if($('profile_file').files?.[0])profile_url=await uploadStoreFile('profile_file');if($('cover_file').files?.[0])cover_url=await uploadStoreFile('cover_file');const b={store_name:$('store_name').value.trim(),store_desc:$('store_desc').value,profile_url,cover_url,style:selectedStyle};await api('/api/admin/settings',{method:'PUT',body:JSON.stringify(b)});$('profile_url').value=profile_url;$('cover_url').value=cover_url;msg('تم حفظ الهوية والصور والاستايل ✅')}catch(e){msg(e.message)}}
window.addEventListener('DOMContentLoaded',()=>{load();loadSettings()});
</script></body></html>`;


export default { async fetch(request,env){ try{ if(request.method==='OPTIONS')return new Response(null,{headers:cors}); const u=new URL(request.url);
 if(u.pathname==='/admin' || u.pathname==='/admin/'){
  await init(env);
  const pr=await env.DB.prepare('SELECT id,name,description,image_url,price,old_price,wholesale_price,category,hot_offer,discount,featured,new_product,sort_order,stock,max_qty,active FROM products WHERE active=1 ORDER BY sort_order ASC,id DESC').all();
  const st=await env.DB.prepare('SELECT store_name,store_desc,profile_url,cover_url,style FROM store_settings WHERE id=1').first();
  const escHtml=(v)=>String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const listHtml=(pr.results||[]).map((p,i)=>'<div class=\"item\"><img src=\"'+escHtml(p.image_url||'')+'\" onerror=\"this.style.visibility=\'hidden\'\"><div style=\"flex:1\"><b>'+escHtml(p.name)+'</b><div class=\"small\">بيع: '+(Number(p.price)||0)+' ج • جملة: '+(Number(p.wholesale_price)||0)+' ج • مخزون: '+(Number(p.stock)||0)+'</div><div>'+(p.hot_offer?'<span class=\"badge\">🔥 عرض ساخن</span>':'')+(p.discount?'<span class=\"badge\">🏷️ تخفيض</span>':'')+(p.featured?'<span class=\"badge\">⭐ مميز</span>':'')+(p.new_product?'<span class=\"badge\">🆕 جديد</span>':'')+'</div><div class=\"actions\"><button type=\"button\" class=\"muted\" onclick=\"edit(productsCache['+i+'])\">تعديل</button><button type=\"button\" class=\"muted\" onclick=\"copyProductLink('+p.id+')\">🔗 نسخ الرابط</button><button type=\"button\" class=\"danger\" onclick=\"removeP('+p.id+')\">إخفاء</button></div></div></div>').join('') || '<div class=\"small\">لا توجد منتجات بعد.</div>';
  let injected=ADMIN_HTML.replace('<div id=\"list\">جاري التحميل...</div>','<div id=\"list\">'+listHtml+'</div>');
  const productsJson=JSON.stringify(pr.results||[]).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  injected=injected.replace("window.addEventListener('DOMContentLoaded',()=>{load();loadSettings()});","window.addEventListener('DOMContentLoaded',()=>{productsCache="+productsJson+";loadSettings()});");
  return new Response(injected,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store, no-cache, must-revalidate'}});
}
 await init(env);
 if(u.pathname.startsWith('/images/') && request.method==='GET'){ if(!env.IMAGES)return new Response('Image storage not configured',{status:503}); const key=decodeURIComponent(u.pathname.slice(8)); const obj=await env.IMAGES.get(key); if(!obj)return new Response('Not found',{status:404}); const h=new Headers();obj.writeHttpMetadata(h);h.set('cache-control','public,max-age=31536000,immutable');return new Response(obj.body,{headers:h}); }
 if(u.pathname==='/' && request.method==='GET')return json({success:true,service:'Green Moon Product API',admin:'/admin'});
 if(u.pathname==='/api/products'&&request.method==='GET'){const r=await env.DB.prepare('SELECT id,name,description,image_url,price,old_price,wholesale_price,category,hot_offer,discount,featured,new_product,sort_order,stock,max_qty,active FROM products WHERE active=1 ORDER BY sort_order ASC,id DESC').all();return json({success:true,products:r.results||[]});}
 if(u.pathname.match(/^\/api\/products\/(\d+)$/)&&request.method==='GET'){const id=Number(u.pathname.split('/').pop());const r=await env.DB.prepare('SELECT id,name,description,image_url,price,old_price,category,hot_offer,discount,featured,new_product,sort_order,stock,max_qty,active FROM products WHERE id=? AND active=1').bind(id).first();return r?json({success:true,product:r}):json({success:false,error:'Product not found'},404);}
 if(u.pathname==='/api/store'&&request.method==='GET'){const s=await env.DB.prepare('SELECT store_name,store_desc,profile_url,cover_url,style FROM store_settings WHERE id=1').first();return json({success:true,settings:s||{}});}
 if(u.pathname==='/api/admin/settings'&&request.method==='GET'){const s=await env.DB.prepare('SELECT store_name,store_desc,profile_url,cover_url,style FROM store_settings WHERE id=1').first();return json({success:true,settings:s||{}});}
 if(u.pathname==='/api/admin/settings'&&request.method==='PUT'){const b=await request.json();await env.DB.prepare('UPDATE store_settings SET store_name=?,store_desc=?,profile_url=?,cover_url=?,style=?,updated_at=CURRENT_TIMESTAMP WHERE id=1').bind(String(b.store_name||'Green Moon Plants and Flowers'),String(b.store_desc||''),String(b.profile_url||''),String(b.cover_url||''),String(b.style||'luxury-emerald')).run();return json({success:true});}
 if(u.pathname==='/api/admin/upload'&&request.method==='POST'){const fd=await request.formData();const f=fd.get('image');if(!f||typeof f.arrayBuffer!=='function')return json({success:false,error:'الصورة مطلوبة'},400);if(!String(f.type||'').startsWith('image/'))return json({success:false,error:'الملف يجب أن يكون صورة'},400);if(f.size>900*1024)return json({success:false,error:'الصورة كبيرة. استخدم صورة أصغر من 900KB'},400);const bytes=new Uint8Array(await f.arrayBuffer());let binary='';const chunk=0x8000;for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode(...bytes.subarray(i,Math.min(i+chunk,bytes.length)));const url='data:'+String(f.type||'image/jpeg')+';base64,'+btoa(binary);return json({success:true,url});}
 if(u.pathname==='/api/admin/products'&&request.method==='GET'){const r=await env.DB.prepare('SELECT * FROM products ORDER BY id DESC').all();return json({success:true,products:r.results||[]});}
 if(u.pathname==='/api/admin/products'&&request.method==='POST'){const b=await request.json();if(!String(b.name||'').trim())return json({success:false,error:'اسم المنتج مطلوب'},400);const r=await env.DB.prepare('INSERT INTO products(name,description,image_url,price,old_price,wholesale_price,category,hot_offer,discount,featured,new_product,sort_order,stock,max_qty,active) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)').bind(String(b.name).trim(),String(b.description||''),String(b.image_url||''),Number(b.price)||0,Number(b.old_price)||0,Math.max(0,Number(b.wholesale_price)||0),String(b.category||'الزرع والنباتات'),b.hot_offer?1:0,b.discount?1:0,b.featured?1:0,b.new_product?1:0,Number(b.sort_order)||0,Math.max(0,Number(b.stock)||0),Math.max(1,Number(b.max_qty)||99)).run();return json({success:true,id:r.meta.last_row_id},201);}
 const m=u.pathname.match(/^\/api\/admin\/products\/(\d+)$/);if(m&&(request.method==='PUT'||request.method==='DELETE')){const id=Number(m[1]);if(request.method==='DELETE'){await env.DB.prepare('UPDATE products SET active=0,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(id).run();return json({success:true});}const b=await request.json();await env.DB.prepare('UPDATE products SET name=?,description=?,image_url=?,price=?,old_price=?,wholesale_price=?,category=?,hot_offer=?,discount=?,featured=?,new_product=?,sort_order=?,stock=?,max_qty=?,active=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(String(b.name||'').trim(),String(b.description||''),String(b.image_url||''),Number(b.price)||0,Number(b.old_price)||0,Math.max(0,Number(b.wholesale_price)||0),String(b.category||'الزرع والنباتات'),b.hot_offer?1:0,b.discount?1:0,b.featured?1:0,b.new_product?1:0,Number(b.sort_order)||0,Math.max(0,Number(b.stock)||0),Math.max(1,Number(b.max_qty)||99),b.active===false?0:1,id).run();return json({success:true});}
 return json({success:false,error:'Not found'},404);
 }catch(e){return json({success:false,error:String(e?.message||e)},500)}}};
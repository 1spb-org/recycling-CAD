/*
* Author: Georgii A. Kupriianov <webmaster@1spb.org>
* http://1spb.org, https://github.com/1spb-org
* All rights reserved.
*
**/

// additional parameter. Ask me what is it.
_aco = '';
	
var center2 = [59.9715, 30.3205]; // САПР ИР в ЛЭТИ
var centerT = [59.9715, 30.3205]; // САПР ИР в ЛЭТИ
var zoom2 = 16;
var _City = 2;
var _Cities = null;
  

var map; 
var markers;
var group;  
var catsToShow = [];  
var catsGroups = [[], [],[],[],[], [],[],[],[], [],[],[],[], [], [],[],[],[],[],[],[]];  
var _maxCats = 13;
var _pcats = '';
var allPoints  = false;
var merged = [];
var _lookupRequest = ""; 
var _baseLink = "";
var _markerId = null;
var _markerCenter = null;
var _admRNO = false;
var _kmlGoogleMID = null;
var _kmlClustered = false;
  
function GetMarkers(data)
{
   markers = DG.markerClusterGroup();
   group = [];
   markerToClick = null;
		  
 	for (var key in data) 
	{ 					 
	  d = data[key];
       // console.log();						 
	  const center = [d.lat, d.lng];  
	                                   
    var icon = DG.icon({
            iconUrl: 'img/'+d.cats+'.png', 
            iconAnchor: [25, 56], 
            popupAnchor: [0,  0],
            className: 'map-icon'+d.cats,
            iconSize: [50, 56]  
    });      		
          
    var cats = d.cats.split('_');
	  var title = d.id + ": " + d.title;
	  var marker = DG.marker(center, { title: title, icon: icon, cats:cats });      
	  const url = 'https://recyclemap.ru/index.php?id=' + d.id;
        
    if(_markerId == d.id)
    {
        _markerCenter = DG.latLng(d.lat, d.lng);
        markerToClick = marker;
    }
	  
   urlLnk = _baseLink + '#id:' + d.id+';'+_City;
   urlCoord = _baseLink + '#geo:' + d.lat+';'+d.lng+';16;;;'+_City;
	 var popupM = '<div class="map-popup">' +
	'<h2><a href="'+ url +'" target="_blank">' + title + '</a></h2>' +
  'Ссылки: <a href="'+ urlLnk +'">Номер</a> | <a target="_top" href="'+ urlCoord +'">Координаты</a></div>'
	  marker.bindPopup(popupM);
    markers.addLayer(marker);
    group.push(marker);
    cats.forEach(function(cat){
     id = Number.parseInt(cat);
    // console.log(id);
     if(!Number.isNaN(id)) 
       catsGroups[id].push(marker);
    });
	}
  
	var popup = '<div class="map-popup">' +
	'<h2><a href="http://iehs.ru" target="_blank" title="МИИЭБЧ / IIEEHS"><img src="iieehs.png"></a></h2>' + 
	'<a href="http://iehs.ru" target="_blank">МИИЭБЧ</a>. Здесь живут САПР и ГИС для рециклинга<br/>'+
	'</div>'
	
		                                  
  mapicon = DG.icon({
    iconUrl: 'marker.png', 
    iconAnchor: [32, 64], 
    popupAnchor: [0, 24],
    className: 'map-icon',
    iconSize: [64, 64]  
  });          
    
  marker2 = DG.marker(centerT, {icon: mapicon})
		.addTo(markers)
		.bindPopup(popup);  
	
   if(_markerId != null)
   {    
    if(_markerCenter == null)
       _markerCenter = DG.latLng(center2[0], center2[1]);
    map = DG.map('map', { center: [_markerCenter.lat, _markerCenter.lng], zoom: 18});  
	  map.addLayer(markers);
    PushStateMarker();
    if(markerToClick != null) 
       markerToClick.showLabel(); 
    map.on('moveend', OnMapMoveEnd ); 
    return;  
   }

	map.addLayer(markers);
  
  if(catsToShow.length != 0)
    ApplyCats();
}

function AfterLoadPlugin()
{
  initLookup();
  
  uriLookup();
  
	jQuery.get('https://сми1.рф/map/rm.php?'+_aco+'city=-1', SecondStep)
  .fail(function(){
   SecondStep(null);
  });  
  
}

function SecondStep(cities)
{  
  _Cities = cities;
  
  if(_Cities != null)
   ProcessCities();
   
  if(_markerId == null)
   CreateMap();
 
	jQuery.get('https://сми1.рф/map/rm.php?'+_aco+'city='+_City, GetMarkers)
  .fail(function(){
   if(_markerId != null) CreateMap();
  });  
  
  if(_admRNO)
   jQuery.get('https://сми1.рф/map/rno-adm.php', GetMarkersRNOAdm);
  else if(_kmlGoogleMID != null)
  { 
   jQuery.get('https://сми1.рф/map/rno-adm.php?mid='+_kmlGoogleMID, GetMarkersRNOAdm);
  }

  jQuery(".trash_type a").each(function()
   { 
    ag = jQuery(this); 
    ag.click(function(evt)
    {
    evt.preventDefault();
    evt.stopPropagation(); 
    Toggle(this);
    }); 
    
    ag.hover(function(evt){ TtHover(this);}, function(evt){ TtUnHover(this);}); 
    
    catsToShow.forEach(function(rr){ if(ag.attr('data-id') == rr) ag.addClass("active"); });
    
    if(ag.attr('data-id') == 1000 && allPoints)
       ag.addClass("active");
 
   });
}

function ProcessCities()
{ 
   oc = jQuery('#o-cities');
  
  /*try { if(_Cities.length > 0)
     oc.attr('size', _Cities.length);
   }
    catch(e){}*/
    
  _Cities.forEach(function(city)
  {
   cid = Number.parseInt(city.id);
   ctitle = city.title;
   psx = (cid == _City)? ' selected="selected"':'';
   if(!Number.isNaN(cid)) 
    jQuery('<option id="opt-city-' + cid + '" data-id="' + cid + '"'+
    psx +'>' + ctitle + '</option>').appendTo(oc);
  });
  
  var gc = _Cities.find(x => x.id == _City);
  if(gc != null)
     center2 = [gc.lat, gc.lng];
  
  oc.change(function () 
  {
    o = jQuery('#o-cities').find('option:selected').first();
    _City =  Number.parseInt(o.attr('data-id'));
    var gc = _Cities.find(x => x.id == _City);
    var newurl = NewUrl(gc.lat, gc.lng, 5);
    window.location.assign(newurl);
    window.location.reload();
  });
}

function CreateMap()
{ 
   map = DG.map('map', { center: center2, zoom: zoom2});   
   map.on('moveend', OnMapMoveEnd );
}

function uriLookup()
{ 
  var L = tryLookup('#geo:');  
  if(L.length > 0)
  {
   var g = lookupLoc( L );
   if(g != null) {  center2 = g.point;  zoom2 = g.zoom; }
   return;
  }
  var L = tryLookup('#city:');  
  if(L.length > 0)
  {
   lookupCity( L ); 
   return;
  }
  L = tryLookup('#id:');
  if(L.length > 0)
  {
   var g = lookupId( L );
   if(g != null)  _markerId = g;
   return;
  }
  L = tryLookup('#adm-rno:');
  if(L == "yes")
  {
    _admRNO = true;
    center2 = [59.9184,30.3051];
    zoom2 = 13;
    return;
  }
  L = tryLookup('?kml-uri=');
  if(L.length > 0)
  { 
   lookupKML(L);
   return;
  }
  L = tryLookup('?clustered-kml-uri=');
  if(L.length > 0)
  { 
   _kmlClustered = true;
   lookupKML(L);
   return;
  }
}


function PushStateMarker()
{
var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname 
+ '#id:' + _markerId;
window.history.pushState({path:newurl},'',newurl);
}

var _cntBeforeRS = 0;

function NewUrl(lat, lng, zoom)
{ 
 return window.location.protocol + "//" + window.location.host + window.location.pathname + '#geo:'
 + lat+';'+lng+';'+zoom+';'+_pcats+';'+(allPoints?'all':'')+';'+_City;
}

function OnMapMoveEnd(e)
{
if(_markerId != null)
{
   _cntBeforeRS ++;    
    if(_cntBeforeRS < 1)
      return;
}
var gc = map.getCenter();
var newurl = NewUrl(gc.lat, gc.lng, map.getZoom());
window.history.replaceState({path:newurl},'',newurl);
}

function tryLookup(w)
{
  if(_lookupRequest.substring(0, w.length) == w)
  {   
    c = _lookupRequest.substring(w.length);
    console.log('found: ' + w + ' >> ' + c);
    return c;
  }
  return '';
}

function initLookup()
{
 var L = window.location;
 _fullPath = L.origin + L.pathname;
 _lookupRequest  = L.href.replace(_fullPath, "");
 _baseLink = L.protocol + "//" + L.host + L.pathname;
 
 if(_lookupRequest[0] == '/')
  _lookupRequest = _lookupRequest.substring(1);
 
 // console.log(_lookupRequest);
}

function TtHover(a)
{
 jQuery('#o-trash-legend').text(a.title);
}

function TtUnHover(a)
{
 jQuery('#o-trash-legend').text("");
}

function arrayRemove(arr, value)
{ 
 return arr.filter(function(ele){ return ele != value; });
}

function Toggle(a)
{
 id = Number.parseInt(a.getAttribute("data-id"));
 p = jQuery(a);
 p.toggleClass("active");
 
 
 if(p.hasClass("active"))
 {
  if (id == 1000)
   allPoints = true;
  else
  { 
  catsToShow.push(id);
  catsToShow.sort(function(a, b) { return a - b; });
  }
 }
 else 
 {
  if (id == 1000)
   allPoints = false;
  else
   catsToShow = arrayRemove(catsToShow, id);
 }
 
 ApplyCats();
}
 
function ApplyCats()
{
  if(catsToShow.length == 0)
  {
    group.forEach(function(m){ m.addTo(markers) });
    return;
  }
  
  if(allPoints)
  {
   var datax = [];
   catsToShow.forEach(function(id){  datax.push(catsGroups[id]);  }); 
   merged = datax.reduce((a, b) => a.filter(c => b.includes(c)));
  } 
  else 
  { 
   merged = [];
   catsToShow.forEach(function(id){  merged = merged.concat(catsGroups[id]);  });
  } 
 
 _pcats = catsToShow.join('+');
 
 merged.forEach(function(m){ m.addTo(markers) });
 group.filter(d => !merged.includes(d)).forEach(function(e){  e.removeFrom(markers) });
  
  // alert(catsToShow.join('-'));
}


function ApplyCatsByLoc()
{  
 var catsP = _pcats.split('+');
 
 catsP.forEach(function(c){
   try { z = Number.parseInt(c);
         if(z > 0 && z <= _maxCats) catsToShow.push(z);
       } catch(e){} 
  });
 catsToShow.sort(function(a, b) { return a - b; });
 _pcats = catsToShow.join('+');
 console.log(_pcats);
 
}

function lookupLoc(loc)
{
 try { 
   x = loc.split(';');
   z = x.length > 2? x[2] : '8';
   lat =  Number.parseFloat(x[0]);
   lng =  Number.parseFloat(x[1]);
   zoom = Number.parseInt(z);
   if(Number.isNaN(lat)) lat = center2[0];
   if(Number.isNaN(lng)) lng = center2[1];
   if(Number.isNaN(zoom)) zoom = 9;
      
   _pcats = x.length > 3? x[3] : '';
   allPoints = x.length > 4? (x[4] == "all") : false;
   _City = x.length > 5?  Number.parseInt(x[5]) : 0;
   if(Number.isNaN(_City)) _City = 0;
  
   ApplyCatsByLoc();
  
   var newurl = NewUrl(lat, lng, zoom);
   //console.log(newurl);
   //console.log({point:[lat,lng]});
   window.history.replaceState({path:newurl},'',newurl);

   return { point:[lat, lng], zoom:zoom};
 }
 catch(e) {}
 return null;
}


function lookupCity(loc)
{
 try { 
   x = loc.split(';'); 
      
   _City = x.length > 0?  Number.parseInt(x[0]) : 2;
   if(Number.isNaN(_City)) _City = 2;
   _pcats = x.length > 1? x[1] : '';
   allPoints = x.length > 2? (x[2] == "all") : false;
   zoom2 = 9;
   ApplyCatsByLoc();
   
   newurl = window.location;
   window.history.replaceState({path:newurl},'',newurl);
  }
 catch(e) {} 
}

function lookupId(id)
{
 try { 
   x = id.split(';');
   markId = Number.parseInt(x[0]);
   if( Number.isNaN(markId))
        return null;
   _City = Number.parseInt(x[1]);
   if( Number.isNaN(_City))
    _City = 2;
   
   return markId;
 }
 catch(e) {}
 return null;
}

function lookupKML(L)
{
   try 
    { 
     var u = new URL(decodeURIComponent(L)); 
     mid = u.searchParams.get('mid');
     cci = u.searchParams.get('clustered-kml-uri');
     if(mid === undefined)
      return;
     if(mid.Length == 0)
      return;      
     uri = _baseLink + '?kml-uri=x%3A//y%3Fmid=' + mid;
     if(cci=="on")
      { _kmlClustered = true;
        uri += '&clustered-kml-uri='+cci; }
       window.history.pushState({path:uri},'',uri);
       jQuery('#o-current-kml').attr('href', uri).text(uri);
     _kmlGoogleMID = mid;
     center2 = [0,0];
     zoom2 = 2;
     console.log(_kmlGoogleMID);
    }
    catch (e)
    {
    console.log(e);
   //   window.location='./#error';
    }
}
 
function onLoad()
{	
  DG
  .then(function() 
	{
   // загрузка кода модуля
   return DG.plugin('https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js');
  })
  .then(AfterLoadPlugin);
}

function geoLocate()
{
 map.stopLocate();
 map.locate({watch:true, setView:true});
}

function geoLocateOnce()
{
 map.locate({setView:true});
}

/* Extras */
var _intMapCreated = null;
var _dataLoadedRNOAdm = null;
var _markersRNOAdm = null;

function GetMarkersRNOAdm(data)
{
  _dataLoadedRNOAdm = data;
  _intMapCreated = setInterval(AddMarkersRNOAdm, 2100);
}

  
function AddMarkersRNOAdm()
{
if(map == null) 
  return;
  
clearInterval(_intMapCreated);

if(_dataLoadedRNOAdm == null)
  return;
  
  console.log(_dataLoadedRNOAdm);
  try 
  {
   var T = toGeoJSON.kml(_dataLoadedRNOAdm);
   
  // console.log(T);
   
   _markersRNOAdm = DG.markerClusterGroup({ iconCreateFunction: function(cluster) {
		return L.divIcon({className: 'clu-div', html: '<b>' + cluster.getChildCount() + '</b>' });
	} });
  
  var addToW = _kmlClustered? _markersRNOAdm : map;
  
  var minLT = Number.MAX_VALUE;
  var minLG = Number.MAX_VALUE;
  var maxLT = Number.MIN_VALUE;
  var maxLG = Number.MIN_VALUE; 
   
   DG.geoJson(T, {
                    onEachFeature: function (feature, layer) 
                    {
                      try 
                      { 
                      var p = feature.properties.description;
                    //  console.log(feature);
                       if (p !== undefined) p = p.replace('<br>','\n').linkify({nl2br:true});
                       else p = '';
                       
                       var popupG = '<div class="map-popup">'
                       +	'<h2><a>' + feature.properties.name + '</a></h2>'
                        + p +'</div>';
	 
                       layer.bindPopup(popupG); 
      
                        var c = feature.geometry.coordinates;
                        if (c !== undefined)  
                        {
                          minLT = Math.min(c[0], minLT); 
                          maxLT = Math.max(c[0], maxLT);  
                          minLG = Math.min(c[1], minLG); 
                          maxLG = Math.max(c[1], maxLG);   
                        }
                       
                       } 
                       catch (e)
                       {
                          console.log(e);
                       }
                    }
                }).addTo(addToW);
                
   if (_kmlClustered)
      _markersRNOAdm.addTo(map);
      
      if(minLT != maxLT && minLG != maxLG)
      {
        v = [[minLG, minLT], [maxLG, maxLT]];
        console.log(v);
        map.flyToBounds(v);       
      }
      
  // if(_kmlGoogleMID != null)  map.fitWorld({maxZoom:3});
  }
  catch(e)
  {
   console.log(e);
  }
}
  
 
		

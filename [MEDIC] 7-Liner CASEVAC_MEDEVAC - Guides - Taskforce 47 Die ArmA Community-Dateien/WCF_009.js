WCF.Location={};WCF.Location.Util={getLocation:function(b,a){if(navigator.geolocation){navigator.geolocation.getCurrentPosition(function(c){b(c.coords.latitude,c.coords.longitude)},function(){b(undefined,undefined)},{timeout:a||5000})}else{b(undefined,undefined)}}};WCF.Location.GoogleMaps={};WCF.Location.GoogleMaps.Settings={_settings:{},get:function(a){if(a===undefined){return this._settings}if(this._settings[a]!==undefined){return this._settings[a]}return null},set:function(b,c){if($.isPlainObject(b)){for(var a in b){this._settings[a]=b[a]}}else{this._settings[b]=c}}};WCF.Location.GoogleMaps.Map=Class.extend({_map:null,_markers:[],init:function(b,a){this._mapContainer=$("#"+b);this._mapOptions=$.extend(true,this._getDefaultMapOptions(),a);this._map=new google.maps.Map(this._mapContainer[0],this._mapOptions);this._markers=[];if(this._mapContainer.parents(".sidebar").length){enquire.register("screen and (max-width: 800px)",{setup:$.proxy(this._addSidebarMapListener,this),deferSetup:true})}this.refresh()},_addInfoWindowEventListener:function(a,b){google.maps.event.addListener(a,"click",$.proxy(function(){b.open(this._map,a)},this))},_addSidebarMapListener:function(){$(".content > .mobileSidebarToggleButton").click($.proxy(this.refresh,this))},_getDefaultMapOptions:function(){var a={};a.center=new google.maps.LatLng(WCF.Location.GoogleMaps.Settings.get("defaultLatitude"),WCF.Location.GoogleMaps.Settings.get("defaultLongitude"));a.disableDoubleClickZoom=WCF.Location.GoogleMaps.Settings.get("disableDoubleClickZoom");a.draggable=WCF.Location.GoogleMaps.Settings.get("draggable");switch(WCF.Location.GoogleMaps.Settings.get("mapType")){case"map":a.mapTypeId=google.maps.MapTypeId.ROADMAP;break;case"satellite":a.mapTypeId=google.maps.MapTypeId.SATELLITE;break;case"physical":a.mapTypeId=google.maps.MapTypeId.TERRAIN;break;case"hybrid":default:a.mapTypeId=google.maps.MapTypeId.HYBRID;break}a.mapTypeControl=WCF.Location.GoogleMaps.Settings.get("mapTypeControl")!="off";if(a.mapTypeControl){switch(WCF.Location.GoogleMaps.Settings.get("mapTypeControl")){case"dropdown":a.mapTypeControlOptions={style:google.maps.MapTypeControlStyle.DROPDOWN_MENU};break;case"horizontalBar":a.mapTypeControlOptions={style:google.maps.MapTypeControlStyle.HORIZONTAL_BAR};break;default:a.mapTypeControlOptions={style:google.maps.MapTypeControlStyle.DEFAULT};break}}a.scaleControl=WCF.Location.GoogleMaps.Settings.get("scaleControl");a.scrollwheel=WCF.Location.GoogleMaps.Settings.get("scrollwheel");a.zoom=WCF.Location.GoogleMaps.Settings.get("zoom");return a},addDraggableMarker:function(c,b){var a=new google.maps.Marker({clickable:false,draggable:true,map:this._map,position:new google.maps.LatLng(c,b),zIndex:1});this._markers.push(a);return a},addMarker:function(g,e,f,d,c){var b=new google.maps.Marker({map:this._map,position:new google.maps.LatLng(g,e),title:f});if(d){b.setIcon(d)}if(c){var a=new google.maps.InfoWindow({content:c});this._addInfoWindowEventListener(b,a);b.infoWindow=a}this._markers.push(b);return b},getMarkers:function(){return this._markers},getMap:function(){return this._map},refresh:function(){var a=this._map.getCenter();google.maps.event.trigger(this._map,"resize");this._map.setCenter(a)},refreshBounds:function(){var f=null;var c=null;var d=null;var g=null;for(var a in this._markers){var e=this._markers[a];var h=e.getPosition().lat();var b=e.getPosition().lng();if(f===null){f=c=h;d=g=b}else{if(f>h){f=h}else{if(c<h){c=h}}if(d>h){d=h}else{if(g<b){g=b}}}}this._map.fitBounds(new google.maps.LatLngBounds(new google.maps.LatLng(f,d),new google.maps.LatLng(c,g)))},removeMarkers:function(){for(var a in this._markers){this._markers[a].setMap(null)}this._markers=[]},setCenter:function(b,a){this._map.setCenter(new google.maps.LatLng(b,a))}});WCF.Location.GoogleMaps.LargeMap=WCF.Location.GoogleMaps.Map.extend({_actionClassName:null,_locationSearch:null,_locationSearchInputSelector:null,_markerClusterer:null,_objectIDs:[],_previousNorthEast:null,_previousSouthWest:null,init:function(d,a,c,b){this._super(d,a);this._actionClassName=c;this._locationSearchInputSelector=b||"";this._objectIDs=[];if(this._locationSearchInputSelector){this._locationSearch=new WCF.Location.GoogleMaps.LocationSearch(b,$.proxy(this._centerMap,this))}this._markerClusterer=new MarkerClusterer(this._map,this._markers,{maxZoom:17});this._markerSpiderfier=new OverlappingMarkerSpiderfier(this._map,{keepSpiderfied:true,markersWontHide:true,markersWontMove:true});this._markerSpiderfier.addListener("click",$.proxy(function(e){if(e.infoWindow){e.infoWindow.open(this._map,e)}},this));this._proxy=new WCF.Action.Proxy({showLoadingOverlay:false,success:$.proxy(this._success,this)});this._previousNorthEast=null;this._previousSouthWest=null;google.maps.event.addListener(this._map,"idle",$.proxy(this._loadMarkers,this))},_addInfoWindowEventListener:function(a,b){},_centerMap:function(a){this.setCenter(a.location.lat(),a.location.lng());$(this._locationSearchInputSelector).val(a.label)},_loadMarkers:function(){var a=this._map.getBounds().getNorthEast();var b=this._map.getBounds().getSouthWest();if(this._previousNorthEast&&this._previousNorthEast.lat()>=a.lat()&&this._previousNorthEast.lng()>=a.lng()&&this._previousSouthWest.lat()<=b.lat()&&this._previousSouthWest.lng()<=b.lng()){return}this._previousNorthEast=a;this._previousSouthWest=b;this._proxy.setOption("data",{actionName:"getMapMarkers",className:this._actionClassName,parameters:{excludedObjectIDs:this._objectIDs,eastLongitude:a.lng(),northLatitude:a.lat(),southLatitude:b.lat(),westLongitude:b.lng()}});this._proxy.sendRequest()},_success:function(d,e,c){if(d.returnValues&&d.returnValues.markers){for(var a in d.returnValues.markers){var b=d.returnValues.markers[a];this.addMarker(b.latitude,b.longitude,b.title,null,b.infoWindow);if(b.objectID){this._objectIDs.push(b.objectID)}else{if(b.objectIDs){this._objectIDs=this._objectIDs.concat(b.objectIDs)}}}}},addMarker:function(f,d,e,c,b){var a=this._super(f,d,e,c,b);this._markerClusterer.addMarker(a);this._markerSpiderfier.addMarker(a);return a}});WCF.Location.GoogleMaps.LocationSearch=WCF.Search.Base.extend({_geocoder:null,init:function(b,e,a,c,d){this._super(b,e,a,c,d);this._geocoder=new google.maps.Geocoder()},_createListItem:function(b){var a=$("<li><span>"+WCF.String.escapeHTML(b.formatted_address)+"</span></li>").appendTo(this._list);a.data("location",b.geometry.location).data("label",b.formatted_address).click($.proxy(this._executeCallback,this));this._itemCount++;return a},_keyUp:function(b){switch(b.which){case $.ui.keyCode.LEFT:case $.ui.keyCode.RIGHT:return;break;case $.ui.keyCode.UP:this._selectPreviousItem();return;break;case $.ui.keyCode.DOWN:this._selectNextItem();return;break;case $.ui.keyCode.ENTER:return this._selectElement(b);break}var a=this._getSearchString(b);if(a===""){this._clearList(true)}else{if(a.length>=this._triggerLength){this._clearList(false);this._geocoder.geocode({address:a},$.proxy(this._success,this))}else{this._clearList(false)}}},_success:function(d,b){if(b!=google.maps.GeocoderStatus.OK){return}if($.getLength(d)){var c=0;for(var a in d){this._createListItem(d[a]);if(++c==10){break}}}else{if(!this._handleEmptyResult()){return}}WCF.CloseOverlayHandler.addCallback("WCF.Search.Base",$.proxy(function(){this._clearList()},this));var e=this._searchInput.parents(".dropdown").wcfIdentify();if(!WCF.Dropdown.getDropdownMenu(e).hasClass("dropdownOpen")){WCF.Dropdown.toggleDropdown(e)}this._itemIndex=-1;if(!WCF.Dropdown.getDropdown(e).data("disableAutoFocus")){this._selectNextItem()}}});WCF.Location.GoogleMaps.LocationInput=Class.extend({_locationSearch:null,_map:null,_marker:null,init:function(d,b,a,e,c){this._searchInput=a;this._map=new WCF.Location.GoogleMaps.Map(d,b);this._locationSearch=new WCF.Location.GoogleMaps.LocationSearch(a,$.proxy(this._setMarkerByLocation,this));if(e&&c){this._marker=this._map.addDraggableMarker(e,c)}else{this._marker=this._map.addDraggableMarker(WCF.Location.GoogleMaps.Settings.get("defaultLatitude"),WCF.Location.GoogleMaps.Settings.get("defaultLongitude"));WCF.Location.Util.getLocation($.proxy(function(g,f){if(g!==undefined&&f!==undefined){WCF.Location.GoogleMaps.Util.moveMarker(this._marker,g,f);WCF.Location.GoogleMaps.Util.focusMarker(this._marker)}},this))}this._marker.addListener("dragend",$.proxy(this._updateLocation,this))},getMap:function(){return this._map},getMarker:function(){return this._marker},_updateLocation:function(){WCF.Location.GoogleMaps.Util.reverseGeocoding($.proxy(function(a){if(a!==null){$(this._searchInput).val(a)}},this),this._marker)},_setMarkerByLocation:function(a){this._marker.setPosition(a.location);WCF.Location.GoogleMaps.Util.focusMarker(this._marker);$(this._searchInput).val(a.label)}});WCF.Location.GoogleMaps.Util={_geocoder:null,focusMarker:function(a){a.getMap().setCenter(a.getPosition())},getMarkerPosition:function(a){return{latitude:a.getPosition().lat(),longitude:a.getPosition().lng()}},moveMarker:function(a,d,b,c){a.setPosition(new google.maps.LatLng(d,b));if(c){google.maps.event.trigger(a,"dragend")}},reverseGeocoding:function(f,a,e,c,b){if(a){e=a.getPosition().lat();c=a.getPosition().lng()}if(this._geocoder===null){this._geocoder=new google.maps.Geocoder()}var d=new google.maps.LatLng(e,c);this._geocoder.geocode({latLng:d},function(h,g){if(g==google.maps.GeocoderStatus.OK){f((b?h:h[0].formatted_address))}else{f(null)}})}};
WCF.Label={};WCF.Label.ACPList=Class.extend({_labelInput:null,_labelList:[],init:function(){this._labelInput=$("#label").keydown($.proxy(this._keyPressed,this)).keyup($.proxy(this._keyPressed,this)).blur($.proxy(this._keyPressed,this));if($.browser.mozilla&&$.browser.touch){this._labelInput.on("input",$.proxy(this._keyPressed,this))}$("#labelList").find('input[type="radio"]').each($.proxy(function(b,a){var c=$(a);if(c.prop("value")!=="custom"){this._labelList.push($(c.next("span")))}},this))},_keyPressed:function(){var a=this._labelInput.prop("value");if(a===""){a=WCF.Language.get("wcf.acp.label.defaultValue")}for(var c=0,b=this._labelList.length;c<b;c++){this._labelList[c].text(a)}}});WCF.Label.ACPList.Connect=Class.extend({init:function(){var a=$("#connect .structuredList li");if(!a.length){return}a.each($.proxy(function(b,c){$(c).find('input[type="checkbox"]').click($.proxy(this._click,this))},this))},_click:function(c){var a=$(c.currentTarget);if(a.is(":checked")){a=a.parents("li");var b=a.data("depth");while(true){a=a.next();if(!a.length){return true}if(a.data("depth")<=b){return true}a.find('input[type="checkbox"]').prop("checked","checked")}}}});WCF.Label.Chooser=Class.extend({_container:null,_groups:{},_showWithoutSelection:false,init:function(f,b,e,h){this._container=null;this._groups={};this._showWithoutSelection=(h===true);this._initContainers(b);if($.getLength(f)){for(var a in f){var d=this._groups[a];if(d){WCF.Dropdown.getDropdownMenu(d.wcfIdentify()).find("> ul > li:not(.dropdownDivider)").each($.proxy(function(k,j){var i=$(j);var l=i.data("labelID")||0;if(l&&f[a]==l){this._selectLabel(i,true)}},this))}}}for(var c in this._containers){var g=this._containers[c];if(g.data("labelID")===undefined){g.data("labelID",0)}}this._container=$(b);if(e){$(e).click($.proxy(this._submit,this))}else{if(this._container.is("form")){this._container.submit($.proxy(this._submit,this))}}},_initContainers:function(a){$(a).find(".labelChooser").each($.proxy(function(d,i){var f=$(i);var b=f.data("groupID");if(!this._groups[b]){var e=f.wcfIdentify();var c=WCF.Dropdown.getDropdownMenu(e);if(c===null){WCF.Dropdown.initDropdown(f.find(".dropdownToggle"));c=WCF.Dropdown.getDropdownMenu(e)}var h=c;if(c.getTagName()=="div"&&c.children(".scrollableDropdownMenu").length){h=$("<ul />").appendTo(c);c=c.children(".scrollableDropdownMenu")}this._groups[b]=f;c.children("li").data("groupID",b).click($.proxy(this._click,this));if(!f.data("forceSelection")||this._showWithoutSelection){$('<li class="dropdownDivider" />').appendTo(h)}if(this._showWithoutSelection){$('<li data-label-id="-1"><span><span class="badge label">'+WCF.Language.get("wcf.label.withoutSelection")+"</span></span></li>").data("groupID",b).appendTo(h).click($.proxy(this._click,this))}if(!f.data("forceSelection")){var g=$('<li data-label-id="0"><span><span class="badge label">'+WCF.Language.get("wcf.label.none")+"</span></span></li>").data("groupID",b).appendTo(h);g.click($.proxy(this._click,this))}}},this))},_click:function(a){this._selectLabel($(a.currentTarget),false)},_selectLabel:function(a,c){var b=this._groups[a.data("groupID")];if(c&&b.data("labelID")!==undefined){return}if(a.data("labelID")){b.data("labelID",a.data("labelID"))}else{b.data("labelID",0)}a=a.find("span > span");b.find(".dropdownToggle > span").removeClass().addClass(a.attr("class")).text(a.text())},_submit:function(){var b=this._container.find(".formSubmit");b.find('input[type="hidden"]').each(function(e,d){var f=$(d);if(f.attr("name").indexOf("labelIDs[")===0){f.remove()}});for(var a in this._groups){var c=this._groups[a];if(c.data("labelID")){$('<input type="hidden" name="labelIDs['+a+']" value="'+c.data("labelID")+'" />').appendTo(b)}}}});
var DCMTable = function(){
	var selected = "none";
	return {
		init: function($DCMTable) {
			if($DCMTable){
				this.$dcmtable = $DCMTable;
			} else {
				this.$dcmtable = $(".DCMTable");
			}
			this.bind(this);
			this.ensureEvenWidth();
			selected = "none";
		},
		bind: function(_self) {
			var self = _self;
			self.$dcmtable.delegate("td", "click", function(eventObj) {
				var $etarget = $(this);
				if(!$etarget.hasClass('selected')){
					var column = $etarget.attr("class");
					if(column.indexOf(" ")>=0) {
						column = column.substring(0, column.indexOf(" "));  //assume column name to be the first class always
					}
					self.$dcmtable.find("td:not('." + column + "')").removeClass("selected");
					self.$dcmtable.find("."+column).addClass("selected");
					selected = column;
					self.selectedHandler(self);
				}
			});
			self.$dcmtable.delegate("td", "mouseover", function() {
				var $etarget = $(this);
				if(!$etarget.hasClass('hover')){
					var column = $etarget.attr("class");
					if(column.indexOf(" ")>=0) {
						column = column.substring(0, column.indexOf(" "));  //assume column name to be the first class always
					}
					self.$dcmtable.find("td:not('." + column + "')").removeClass("hover");
					self.$dcmtable.find("."+column).addClass("hover");
				}
			});
			self.$dcmtable.delegate("td", "mouseout", function() {
				var $etarget = $(this);
				if($etarget.hasClass('hover')){
					var column = $etarget.attr("class");
					if(column.indexOf(" ")>=0) {
						column = column.substring(0, column.indexOf(" "));  //assume column name to be the first class always
					}
					self.$dcmtable.find("."+column).removeClass("hover");
				}
			});
		},
		ensureEvenWidth: function() {
			var $dataColumn = this.$dcmtable.find("thead tr:first").children("th:not(:first)");
			var numDataColumn = $dataColumn.length;
			var totalw = 0;
			for(var i=0; i<numDataColumn; i++) {
				totalw += $dataColumn.eq(i).innerWidth();
			}
			var newWidth = Math.floor(totalw / numDataColumn);
			$dataColumn.width(newWidth);
		},
		selectedHandler: function(theTable) {
			alert("Default Selected Handler: " + this.getSelected() + " is selected.");
		},
		getSelected: function(){
			return selected;
		}
	}
}();
GPlot
=============
A simple javascript utility for clustering markers using the [Google Mapis V3 API](http://code.google.com/apis/maps/documentation/javascript/reference.html) that allows you to style the window using CSS.
  
Usage
=============

    var mapOptions = {
        zoom: 8,
        center: new google.maps.LatLng(45.523452, -122.676207),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    
    var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    
    var i = 0;
    while(i < 22) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(45.51991, -122.707844),
            map: map
        });
        i++; 
    }
    

Options
=============
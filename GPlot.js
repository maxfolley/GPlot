// Main js file for global itenerary map
function GPlot(map, options) {
    this.map_ = map;
    options = options || {};
    
    this.clusters_ = [];
    this.numClusters_ = 0;
    this.points_ = options.points || [];

    var latLngMap = {},
        clusters = [],
        numClusters = 0,
        inited = false,
        projection,
        self = this;
    
    // Store information for the map
    var clusterMap = {}, fitleredData = {}, initPlotData = [], mapData, numInFilter, numInitPlot;
    var bounds = new google.maps.LatLngBounds();
    var map, infowindow;
    
    this.initMap();
    
    /*
     * Resets all markers and data and adds markers to map
     * given the maps current projection
     */
    function addAllMarkers() {        
        // Remove all markers
        var i = 0;
        while(i < numClusters) {
            clusters[i].clear();
            i++;
        }
        clusters = [];
        numClusters = 0;
        clusterMap = {};
        // Clear all markers
        // Member data is keyed by filter category id
        var i = 0;
        while(i < numInitPlot) {
            codeAddress(initPlotData[i]);
            i++;
        }
    }
    
    function codeAddress(data) {        
        if(data instanceof Array) {
            // Go ahead and add items the already have lat long defined
            var coded = [], i = 0, info;
            while(i < data.length) {
                info = data[i];
                addLatLong(info, limitToBounds);
                i++; 
            }
        } else {
            addLatLong(data, limitToBounds);
        }
    }
    
    /*
     * Checks if the data contains valid lat long point
     */
    function hasValidPoint(data) {
        return (typeof data.latitude != "undefined" && data.longitude != "undefined" && data.latitude != null && data.longitude != null && !isNaN(data.latitude) && !isNaN(data.longitude));
    }
    
    function addPoint(e, cat_id) {
        codeAddress(mapData[cat_id], true);
    }
}

GPlot.prototype.addAllMarkers = function() {
    // Remove all markers
    var i = 0;
    while(i < this.numClusters_) {
        this.clusters_[i].clear();
        i++;
    }
    this.clusters_ = [];
    this.numClusters_ = 0;
    clusterMap = {};
    // Clear all markers
    // Member data is keyed by filter category id
    i = 0;
    while(i < this.points_.length) {
        this.addLatLong(this.points_[i]);
        i++;
    }
}

GPlot.prototype.addLatLong = function(point) {
    // if(!bounds.contains(point)) return;
    // bounds.extend(point);
        
    // Create cluster
    var i = 0, cluster, clusters = this.clusters_;
    while(i < this.numClusters_) {
        cluster = clusters[i];
        if(cluster.intersects(point)) {
            cluster.addMarker(point);
            return;
        }
        i++;
    }
    
    // If not within bounds of any current clusters, add a new one
    cluster = new Cluster(this.map_, this.projection_);
    cluster.addMarker(point);
    
    clusters.push(cluster);
    this.numClusters_ = clusters.length;
}

GPlot.prototype.addPoint = function(point) {        
    if(data instanceof Array) {
        // Go ahead and add items the already have lat long defined
        var coded = [], i = 0, info;
        while(i < data.length) {
            info = data[i];
            addLatLong(info, limitToBounds);
            i++; 
        }
    } else {
        addLatLong(data, limitToBounds);
    }
}

GPlot.prototype.initMap = function(latLng) {
    var overlay = new google.maps.OverlayView(),
        points = this.points_,
        self = this;
    this.overlay_ = overlay;
    
    var inited = false;
    overlay.draw = function() {
        if(!inited) {
            self.projection_ = overlay.getProjection();
            // Loop mapData creating initial data map
            var i = 0, numPoints = points.length;
            // Loop members for category, if valid points, we push into init plot array that is used to refresh the map
            while(i < numPoints) {
                self.addAllMarkers();
                // initPlotData.push(this.points[i]);
                // codeAddress(this.points[i]);
                i++;
            }
            // numInitPlot = initPlotData.length;
            // map.fitBounds(bounds);
        }
        inited = true;
    };
    overlay.setMap(this.map_);  
    
    google.maps.event.addListener(this.map_, "idle", function() {
        // bounds = this.map_.getBounds();
        self.addAllMarkers();
    });
}

GPlot.prototype.plot = function(latLng) {
    
}

function Cluster(map, projection) {
    this.map_ = map;
    this.projection_ = projection;
    this.plots_ = [];
    this.maxZoom_ = 16;
    this.numPlots_ = 0;
    this.rad_ = 70;
}

Cluster.prototype.addMarker = function(point) {
    if(typeof this.marker_ === "undefined") {
        this.center_ = this.projection_.fromLatLngToDivPixel(point);
        this.marker_ = new ClusterMarker(point, this.map_);
    } else if(this.numPlots_ === 1) {
        this.marker_.setIcon("cluster.png");
    }
    this.plots_.push(point);
    this.numPlots_ = this.plots_.length;
    this.marker_.setCount(this.numPlots_);
}

Cluster.prototype.clear = function(latLng) {
    this.marker_.remove();
}

Cluster.prototype.intersects = function(point) {
    if(this.map_.getZoom() >= this.maxZoom_) return false;
    var pos = this.projection_.fromLatLngToDivPixel(point);
    var dx = this.center_.x - pos.x;
    var dy = this.center_.y - pos.y;
    var dist = Math.sqrt(dx*dx + dy*dy);
    return dist <= this.rad_;
}

function ClusterMarker(latLong, map, title, icon, infoWindow, wData) {
    this.latLong = latLong;
    this.map_ = map;
    this.title_ = title;
    this.icon_ = icon;
    this.setMap(map);
    this.count_ = 0;
    this.infoWindow_ = infoWindow;
    this.windowData_ = wData;
    
    var self = this;
    
    // Add overlay div to map
    var div = document.createElement("DIV");
    div.style.cssText = "cursor:pointer;"
    div.style.background = "url('" + icon + "') no-repeat"; 
    div.style.position = "absolute";
    div.style.width = "50px";
    div.style.height = "50px";
    // div.style.visibility = "hidden";
    div.setAttribute("class", "cluster-marker");
    
    var content = "<h1 style='color:#FFF;font-family:Verdana;font-size:11px;line-height:40px;text-align:center;width:38px;'>0</h1>";
    div.innerHTML = content;
    
    this.div_ = div;
    this.h1_ = div.getElementsByTagName("h1")[0];
    
    this.getPanes().overlayImage.appendChild(div);
    this.draw();
    
    this.mapListener_ = google.maps.event.addDomListener(div, "click", function() {
        if(self.count_ > 1) {
            map.panTo(self.latLong);
            map.setZoom(self.map_.getZoom()+1);
        } else if(typeof self.infoWindow_ !== "undefined" && typeof self.windowData_ !== "undefined") {
            map.panTo(self.latLong);
            map.panBy(0, -120);
            self.infoWindow_.open(self.latLong, self.windowData_);
        }
    });
    
    this.setCount = function(count) {
        this.count_ = count;
        this.h1_.innerHTML = count;
        this.h1_.style.visibility = (count <= 1) ? "hidden" : "visible";
    }
    
    this.setIcon = function(icon) {
        div.style.background = "url('" + icon + "') no-repeat"; 
    }
};

ClusterMarker.prototype = new google.maps.OverlayView;

ClusterMarker.prototype.draw = function() {
    var overlayProjection = this.getProjection();
    var point = overlayProjection.fromLatLngToDivPixel(this.latLong);

    this.div_.style.left = point.x - 18 + "px";
    this.div_.style.top = point.y - 50 + "px";
}

ClusterMarker.prototype.remove = function () {
    google.maps.event.removeListener(this.mapListener_);
    this.div_.parentNode.removeChild(this.div_);
}
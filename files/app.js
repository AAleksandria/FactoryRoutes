
      var map;                  // переменная с картой 
      var latlngmap;            // координаты построения карты
      var latlngA;              // координаты начального пути
      var latlngB;              // координаты конечного пути
      var directionsDisplay;    // обеспечивает отображение пути, маркеров
      var directionsService;    // объект взаимодействует c Direction Service API, 
                                // получает запросы маршрутов и возвращает рассчитанные результаты
      // var marker;               // хранит маркер точки А

      var routeFromJSON;        // хранит данные с файла dbRoute.json

      var comboFactory = document.getElementById('factory');
      var comboRoute = document.getElementById('route');

      var start_address = document.getElementById('start_address'); // элемент для вывода начального адреса
      var end_address = document.getElementById('end_address');     // элемент для вывода конечного адреса
      var time = document.getElementById('time');                   // элемент для вывода времени движения
      var distance = document.getElementById('distance');           // элемент для вывода расстояния пути

      // чтение файла files/dbRoute.json, в котором хранятся маршруты заводов  
      $.getJSON("files/dbRoute.json", function(data) {
        routeFromJSON = data;
      });


      // инициализация карты, установка addListener для перехвата DOM событий
      function initMap() {
        directionsDisplay = new google.maps.DirectionsRenderer({
          draggable: true
        });                                                     // обеспечивает отображение пути, маркеров
        directionsService = new google.maps.DirectionsService;  // объект взаимодействует c Direction Service API, 
                                                                // получает запросы маршрутов и возвращает рассчитанные результаты
        
        latlngmap = new google.maps.LatLng(47.769022, 29.0105566);
        
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 14,
          center: latlngmap
        });                                                     // создаём карту для отображения 

        directionsDisplay.setMap(map);                          // вывод карты  
        loadCombo();

        comboFactory.addEventListener('change', function() {
          calculateAndDisplayRoute(directionsService, directionsDisplay);
        });

        comboRoute.addEventListener('change', function() {
          calculateAndDisplayRoute(directionsService, directionsDisplay);
        });

        // после перетаскивания пути будет изменён вывод описания
        directionsDisplay.addListener('directions_changed', function() {
          computeTotalDistance(directionsDisplay.getDirections());
        });

        // // по нажатию на правую кнопку мыши будет выводено контекстное меню
        // google.maps.event.addListener(map, "rightclick", function(event){
        //   showContextMenu(event.latLng);
        // });
        
        // // по нажатию на левую кнопку мыши будет удалено меню
        // google.maps.event.addListener(map, 'click', function() {
        //   $('.dropdown').remove();
        // });

      }

      // // добавление маркера по нажатию правой кнопки
      // function addMarker(location, map) {
      //   marker = new google.maps.Marker({
      //     position: location,
      //     label: "A",
      //     map: map
      //   });
      // }

      // загрузка с файла, запись элементов списка с заводами для выбора
      function loadCombo(){

        // создание элементов списка отвечающие за выбор заводов (select id factory)
        for(var i = 0; i < routeFromJSON.length; i++){
          comboFactory.options[comboFactory.options.length] = new Option(routeFromJSON[i]["factory"], routeFromJSON[i]["value"]);
        }
        
        // event listener для списка с заводами
        comboFactory.addEventListener('change', function() {
          // удаление списка с маршрутами 
          for (var i=comboRoute.options.length-1; i >= 0; i--){
            comboRoute.remove(i);
          }

          // создание элементов списка отвечающие за выбор маршрутов (select id route)
          for(var i = 0; i < routeFromJSON.length; i++){ 
            if (routeFromJSON[i]["value"] === comboFactory.value){
              var myroute = routeFromJSON[i]["route"]
              for(var j = 0; j < myroute.length; j++){
                comboRoute.options[comboRoute.options.length] = new Option(myroute[j]["route_name"], myroute[j]["value"]);
              }
            }
          }
        });
      }

      // когда перетаскиваем путь меняет данные на новые 
      function computeTotalDistance(result) {
        var route = result.routes[0];
        // for (var i = 0; i < route.legs.length; i++) {
        //   start_address.textContent = route.legs[i].start_address;
        //   end_address.textContent = route.legs[i].end_address;
        //   time.textContent = route.legs[i].duration.text;
        //   distance.textContent = route.legs[i].distance.text;
        // }
      
            var summaryPanel = document.getElementById('directions-panel');
                summaryPanel.innerHTML = '';
                summaryPanel.style.visibility = "visible";
                
            // For each route, display summary information.
            for (var i = 0; i < route.legs.length; i++) {
              var routeSegment = i + 1;


              summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
                  '</b><br>';
              summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
              summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
              summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
              }
      }
      
      // генерация пути 
      function calculateAndDisplayRoute(directionsService, directionsDisplay) {
          var waypts = [];       // [  [41.12331,23.124124]; [41.12331,23.124124]  ]
          var routes;
          for (var i = 0; i < routeFromJSON.length; i++){
            if (routeFromJSON[i]["value"] == comboFactory.value){
              routes = routeFromJSON[i]["route"];
            }
          }

          // проверка на выбор маршрута по combobox
          for (var cntRoutes = 0; cntRoutes < routes.length; cntRoutes++){
            if (routes[cntRoutes]["value"] == parseInt(comboRoute.value)){
              
              var latA = routes[cntRoutes]["start_point"][0];
              var lngA = routes[cntRoutes]["start_point"][1];

              var latB = routes[cntRoutes]["end_point"][0];
              var lngB = routes[cntRoutes]["end_point"][1];

              latlngA = new google.maps.LatLng(latA,lngA);
              latlngB = new google.maps.LatLng(latB,lngB);

              var cntWaypts = routes[cntRoutes]["waypoints"].length;

              for (var i = 0; i < cntWaypts; i++){
                var cntPoints = routes[cntRoutes]["waypoints"][i]["points"].length;
                var first = routes[cntRoutes]["waypoints"][i]["points"][0];
                var second = routes[cntRoutes]["waypoints"][i]["points"][1];
                
                var pointWay = new google.maps.LatLng(first,second);
                waypts.push({
                  location: pointWay,
                  stopover: true
                });

                // console.log("CountPoints: ", cntPoints);
                // waypts[i] = [];
                // for (var j = 0; j < cntPoints; j++){
                //   waypts[i][j] = routes[cntRoutes]["waypoints"][i]["points"][j];
                // }

              }
              // console.log(waypts);
            }
          }


          directionsService.route({                                 // посылаем на сервер данные с начальным,
            origin: latlngA,                                        // конечным путём и способом передвежения
            destination: latlngB,  
            waypoints: waypts,
            optimizeWaypoints: true,
            travelMode: 'DRIVING'
          }, function(response, status) {                           // ответом служит готовый путь
            if (status == 'OK') {
              directionsDisplay.setDirections(response);            // отображаем путь на карте
              var route = response.routes[0];
              // console.log("ResponseRoute:", response.routes);

              var summaryPanel = document.getElementById('directions-panel');
                  summaryPanel.innerHTML = '';
                  summaryPanel.style.visibility = "visible";

              // For each route, display summary information.
              for (var i = 0; i < route.legs.length; i++) {
                var routeSegment = i + 1;


                summaryPanel.innerHTML += '<b><i>Маршрут:</i> ' + routeSegment +
                    '</b><br>';
                summaryPanel.innerHTML += "<b>Откуда:</b> " + route.legs[i].start_address + '<br>';
                summaryPanel.innerHTML += "<b>Куда:</b> " + route.legs[i].end_address + '<br>';
                summaryPanel.innerHTML += "<b>Расстояние:</b> " + route.legs[i].distance.text + '<br>';
                summaryPanel.innerHTML += "<b>Время:</b> " + route.legs[i].duration.text + '<br><br>';
              }


            } else {
              window.alert('Directions request failed due to ' + status);
            }
          });
        }
      // }

      // берём координаты для отображения контекстного меню
      function getCanvasXY(caurrentLatLng){
        var scale = Math.pow(2, map.getZoom());
        var nw = new google.maps.LatLng(
             map.getBounds().getNorthEast().lat(),
             map.getBounds().getSouthWest().lng()
        );
        var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
        var worldCoordinate = map.getProjection().fromLatLngToPoint(caurrentLatLng);
        var caurrentLatLngOffset = new google.maps.Point(
             Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
             Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
        );
        return caurrentLatLngOffset;
      }

      // создание компонента для контекстного меню
      function setMenuXY(caurrentLatLng){
        var mapWidth = $('#map').width();
        var mapHeight = $('#map').height();
        var menuWidth = $('.dropdown').width();
        var menuHeight = $('.dropdown').height();
        var clickedPosition = getCanvasXY(caurrentLatLng);
        var x = clickedPosition.x ;
        var y = clickedPosition.y ;
    
        if((mapWidth - x ) < menuWidth)
          x = x - menuWidth;
        if((mapHeight - y ) < menuHeight)
          y = y - menuHeight;
    
        $('.dropdown').css('left', x);
        $('.dropdown').css('top', y);
      }

      // отображение контекстного меню
      function showContextMenu(caurrentLatLng){
        var projection;
        var contextmenuDir;

        projection = map.getProjection();

        $('.dropdown').remove();
        contextmenuDir = document.createElement("div");
        contextmenuDir.className  = 'dropdown';

        contextmenuDir.innerHTML = "<ul class=\"dropdown-menu\">\
          <li class=\"click1\"><a href=\"#\">Создать маршрут</a></li>\
          <li class=\"click4\"><a href=\"#\">Удалить маршрут</a></li>\
        </ul>";
        $(map.getDiv()).append(contextmenuDir);
        setMenuXY(caurrentLatLng);
        contextmenuDir.style.visibility = "visible";

        // по нажатию на 1 пункт меню устанавливаем начальную точку
        $('.click1').click(function(){
          if(marker){
            marker.setMap(null);
          }
          latlngA = caurrentLatLng;
          addMarker(latlngA, map);
          $('.dropdown').remove();
        });

        // по нажатию на 2 пункт меню устанавливаем конеччную точку и генерируем путь
        $('.click2').click(function(){
          latlngB = caurrentLatLng;
          calculateAndDisplayRoute(directionsService, directionsDisplay);
          $('.dropdown').remove();
        });

        // по нажатию на 3 пункт меню удаляем существующий путь
        $('.click3').click(function(){
          if(marker){
            marker.setMap(null);
          }
          latlngA = null;
          latlngB = null;
          start_address.textContent = "-";
          end_address.textContent = "-";
          time.textContent = "-";
          distance.textContent = "-";
          $('.dropdown').remove();
          directionsDisplay.setDirections({routes: []});
        });
          
      
        // $('.click4').click(function(){
        //   loadCombo();
        // });
      }

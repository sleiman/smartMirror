setInterval(getConfig,4000);
allArticles=[];
function getConfig(){
    $.ajax({
	  url: 'php/getConfig.php',
	  success: setConfigs,
	  dataType: "text",
	  method: "GET"
	});
}

function setConfigs(data){
    data = JSON.parse(data);
    if(window.config && window.config.id == data.id){
        return;   
    }
    window.config = data;
    name = fixName(data.name);
    zip = data.zip;
    city_id = data.city_id;
    city_name = data.city_name;
    subjects = data.subjects;
    nyt_api_key = data.nyt_api_key;
    openweather_api_key = data.openweather_api_key;
    
    //function calls
    clearTimeout(window.weatherTimeoutToday);
    clearTimeout(window.weatherTimeoutWeek);
    
    updateClock(name);
    updateWeather();
    //updateOpenWeatherToday();
   // updateOpenWeatherWeek();
    console.log(subjects);
    if(subjects[0]=="noNews"){
        console.log("noNews");
        $(".newsFeed").hide();
        $(".feedLabel").hide();
        
    }
    else{
        $(".newsFeed").show();
        $(".feedLabel").show();
        getNews(subjects,nyt_api_key);
    }
    
    
}
function fixName(name){
    console.log(name);
    //ensures that is name is always displayed with first letter caps then all others lower
    var first = name.charAt(0).toUpperCase();
    var rest = name.substring(1,name.length);
    rest.toString().toLowerCase();
    
    return first+rest;
}

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  if (hours > 4 && hours <13){
      $(".greetingText").html("Good Morning "+name);
  }
  else if(hours > 12 && hours <18){
      $(".greetingText").html("Good Afternoon "+name);
  }
  else if(hours > 17 && hours <22){
      $(".greetingText").html("Good Evening "+name);
  }
  else{
     $(".greetingText").html("Good Night "+name); 
  }
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  seconds = seconds < 10 ? '0'+seconds : seconds;
  var strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
  return strTime;
}

function updateClock() {
    var now = new Date(), // current date
        months = ['January', 'February', 'March','April','May','June','July','August','September','October','November','December'];
        date = [ months[now.getMonth()], now.getDate()].join(' ');
        
        time = formatAMPM(now);
    // set the content of the element with the ID time to the formatted string
    $('#date').html(date);
	$('#time').html(time);
}

setInterval(updateClock, 1000); //recurring call

function getNews(){
    $(subjects).each(function (i,v){
        $.ajax({
              url: 'https://api.nytimes.com/svc/topstories/v2/'+v+'.json?api-key='+nyt_api_key,
              success: organizeNews,
              dataType: "text",
              method: "GET"
            });
    })
    
}
function organizeNews(data){
        data = JSON.parse(data)
        var mixed=[];
        allArticles.push(data.results);
        
        if(allArticles.length == subjects.length){
            console.log(allArticles);
            $.each(allArticles, function (i,section){
                $.each(section, function (i,article){
                    mixed.push(article);
                })
            })
            shuffleArray(mixed);
            displayNews(mixed);
        }
        else{}
    }
    
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function displayNews(data){
    articles = "";
    $.each(data, function(index, article){
        articles += "<div class = 'article'><div class = 'newsTitle'>"+ article.title+ "</div> <div class = 'newsAbstract'>"+article.abstract+"</div></div>";
    });
    $('.newsFeed').append(articles);
    autoScroll();
}
function autoScroll(){
    console.log("here");
    $('.newsFeed').scrollTop = 0;
    
    var height = 0;
    
    $('.article').each(function(i, value){
        height += parseInt($(this).height());
    });
    
    console.log(height);
       
    $('.newsFeed').animate({scrollTop: height},1000000);
    setTimeout(autoScroll,105000);
};


function updateWeather(){
	$.ajax({
	  url: 'https://api.openweathermap.org/data/2.5/weather?q='+city_name+'&appid='+openweather_api_key+'&units=metric',
	  success: displayWeather,
	  dataType: "text",
	  method: "GET"
	});
    
    window.weatherTimeout = setTimeout(updateWeather, 60000);
}

function updateOpenWeatherToday(){
    $.ajax({
	  url: 'https://api.openweathermap.org/data/2.5/weather?q='+city_name+'&appid='+openweather_api_key+'&units=metric',
	  success: displayOpenWeatherToday,
	  dataType: "text",
	  method: "GET"
	});
    
    window.weatherTimeoutToday = setTimeout(updateOpenWeatherToday, 60000);
}

function displayOpenWeatherToday(weather_data){
		var weather_data = JSON.parse(weather_data);
        console.log(weather_data);
		$('.temp').html(weather_data.main.temp+"&#x2109");
        $('.temp_location').html(weather_data.name);
		$('.temp_max').html("High: "+weather_data.main.temp_max+"&#x2109");
		$('.temp_min').html("Low: "+weather_data.main.temp_min+"&#x2109");
        $('.weatherIcon').html('<img class = "icon" src="https://openweathermap.org/img/w/'+weather_data.weather[0].icon+'.png">');  
	}

function updateOpenWeatherWeek(){
    $.ajax({
	  url: 'https://api.openweathermap.org/data/2.5/forecast/daily?q='+city_name+'&appid='+openweather_api_key,
	  success: displayOpenWeatherWeek,
	  dataType: "text",
	  method: "GET"
	});    
    
    window.weatherTimeoutWeek = setTimeout(updateOpenWeatherWeek, 60000);
}    
  
function displayOpenWeatherWeek(data){
		var data = JSON.parse(data);
        console.log(data);
        //five day forecast
        function getWeekday(num){
            var weekday=[];
            var current = num;
            for(i = 0;i<5;i++){
               if (current == 6){
                   current = 0;
                    weekday.push(current);
               }
               else{
                   current = current+1;
                   weekday.push(current);
               }
            }
            return weekday;
        }
        var weekArray = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        var d = new Date().getDay();
        weekIndex = getWeekday(d);
        $('.day1Label').html(weekArray[weekIndex[0]]);
        $('.day2Label').html(weekArray[weekIndex[1]]);
        $('.day3Label').html(weekArray[weekIndex[2]]);
        $('.day4Label').html(weekArray[weekIndex[3]]);
        $('.day5Label').html(weekArray[weekIndex[4]]);
        $('.weatherIcon1').html('<img class = "smaller" src="https://openweathermap.org/img/w/' +data.list[1].weather[0].icon+ '.png">');
        $('.weatherIcon2').html('<img class = "smaller" src="https://openweathermap.org/img/w/' +data.list[2].weather[0].icon+ '.png">');
        $('.weatherIcon3').html('<img class = "smaller" src="https://openweathermap.org/img/w/' +data.list[3].weather[0].icon+ '.png">');
        $('.weatherIcon4').html('<img class = "smaller" src="https://openweathermap.org/img/w/' +data.list[4].weather[0].icon+ '.png">');
        $('.weatherIcon5').html('<img class = "smaller" src="https://openweathermap.org/img/w/' +data.list[5].weather[0].icon+ '.png">');
        $('.day1').html(data.list[1].temp.day+"&#x2109");
        $('.day2').html(data.list[2].temp.day+"&#x2109");
        $('.day3').html(data.list[3].temp.day+"&#x2109");
        $('.day4').html(data.list[4].temp.day+"&#x2109");
        $('.day5').html(data.list[5].temp.day+"&#x2109");   
	}
  
function displayWeather(data){
		var data = JSON.parse(data);
    console.log(data);
		$('.temp').html(data.main.temp+"&#x2103");
  //       $('.temp_location').html(data.location.name);
		// $('.temp_max').html("High: "+data.forecast.forecastday[0].day.maxtemp_f+"&#x2109");
		// $('.temp_min').html("Low: "+data.forecast.forecastday[0].day.mintemp_f+"&#x2109");
  //       $('.weatherIcon').html('<img class = "icon" src=' +data.current.condition.icon + '>');
        
  //       //five day forecast
  //       function getWeekday(num){
  //           var weekday=[];
  //           var current = num;
  //           for(i = 0;i<5;i++){
  //              if (current == 6){
  //                  current = 0;
  //                   weekday.push(current);
  //              }
  //              else{
  //                  current = current+1;
  //                  weekday.push(current);
  //              }
  //           }
  //           return weekday;
  //       }
  //       var weekArray = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  //       var d = new Date().getDay();
  //       weekIndex = getWeekday(d);
  //       $('.day1Label').html(weekArray[weekIndex[0]]);
  //       $('.day2Label').html(weekArray[weekIndex[1]]);
  //       $('.day3Label').html(weekArray[weekIndex[2]]);
  //       $('.day4Label').html(weekArray[weekIndex[3]]);
  //       $('.day5Label').html(weekArray[weekIndex[4]]);
  //       $('.weatherIcon1').html('<img class = "smaller" src=' +data.forecast.forecastday[1].day.condition.icon+ '>');
  //       $('.weatherIcon2').html('<img class = "smaller" src=' +data.forecast.forecastday[2].day.condition.icon+ '>');
  //       $('.weatherIcon3').html('<img class = "smaller" src=' +data.forecast.forecastday[3].day.condition.icon+ '>');
  //       $('.weatherIcon4').html('<img class = "smaller" src=' +data.forecast.forecastday[4].day.condition.icon+ '>');
  //       $('.weatherIcon5').html('<img class = "smaller" src=' +data.forecast.forecastday[5].day.condition.icon+ '>');
  //       $('.day1').html(data.forecast.forecastday[1].day.avgtemp_f+"&#x2109");
  //       $('.day2').html(data.forecast.forecastday[2].day.avgtemp_f+"&#x2109");
  //       $('.day3').html(data.forecast.forecastday[3].day.avgtemp_f+"&#x2109");
  //       $('.day4').html(data.forecast.forecastday[4].day.avgtemp_f+"&#x2109");
  //       $('.day5').html(data.forecast.forecastday[5].day.avgtemp_f+"&#x2109");    
	}



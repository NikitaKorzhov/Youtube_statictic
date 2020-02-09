$(document).ready(() => {
  var client_id = "25550250520-rosegibeo5391nt58pehh9pkna2gv9qj.apps.googleusercontent.com";
  var api_key = "AIzaSyCVjmtpRuWyqMUFy6S6QCrNVOluyM70Na8";
  function authenticate() {
    return gapi.auth2.getAuthInstance()
      .signIn({ scope: "https://www.googleapis.com/auth/youtube.readonly" })
      .then(function () { console.log("Sign-in successful"); $("#first").hide(); $("#stat").show() },
        function (err) { console.error("Error signing in", err); });
  }
  function loadClient() {
    gapi.client.setApiKey(api_key);
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
      .then(function () { console.log("GAPI client loaded for API"); },
        function (err) { console.error("Error loading GAPI client for API", err); });
  }
  gapi.load("client:auth2", function () {
    gapi.auth2.init({ client_id: client_id });
  });

  chanalInfo = async function (id) {
    let request_params = { "part": "snippet,contentDetails,statistics", "maxResults": 50, "id": id }
    return await gapi.client.youtube.channels.list(request_params).then(response => response.result.items)
  }
  push = function (item) {
    return { chanal: item.snippet.channelTitle, channelId: item.snippet.channelId, videos: [{ id: item.id, title: item.snippet.title }], count: 1 }
  }

  getChannels = async function (items) {
    for (i = 0; i < parseInt(items.length); i += 50) {
      let t = "";
      for (j = i; j < i + 50; j++) {
        if (j != i) { t += "," }
        if (j < items.length) {
          t += items[j].channelId;
        }
      }
      c = await chanalInfo(t);
      c.map(el => {
        items.forEach(item => {
          if (item.channelId == el.id) {
            item.description = el.snippet.description
            item.subscribers = el.statistics.subscriberCount
            item.picture = el.snippet.thumbnails.default.url
            item.url = `https://www.youtube.com/channel/${item.channelId}`
          }
        })
      })
    }
    return items;
  }
  var formStatistics = function (items) {
    let statistics_list = []
    items.map(el => {
      if (statistics_list.some(ii => ii.channelId === el.snippet.channelId)) {
        statistics_list.map(it => {
          if (it.channelId === el.snippet.channelId) {
            it.count++
            it.videos.push({ id: el.id, title: el.snippet.title })
          }
        })
      }
      else {
        aaa = push(el)
        statistics_list.push(aaa)
      }
    })
    statistics_list.sort((a, b) => a.count < b.count ? 1 : -1)
    return statistics_list
  }

  fragen = async function () {
    let iterator = 1;
    let leked_videos = []
    npt = ""
    params = { "part": "snippet,contentDetails,statistics", "maxResults": 50, "myRating": "like" }

    for (i = 0; i < iterator; i++) {
      console.log(iterator + " " + i)
      npt != "" ? params.pageToken = npt : "";
      result = await gapi.client.youtube.videos.list(params).then(response => response.result);
      npt = result.nextPageToken;
      iterator = parseInt(1 + (result.pageInfo.totalResults / 50));

      result.items.map(y => leked_videos.push(y))
    }
    return leked_videos;
  }
  function execute() {
    $("#stat").hide();
    $("#wait").show();
    return fragen()
      .then(function (response) {
        let s = formStatistics(response)
        console.log(s)
        getChannels(s).then(u => {
          u.forEach(element => element.persent = element.count * 100 / response.length);
          $("#an").show();
          //    response.map(item => $("#list").append(`<p>${item.snippet.title}</p>`));
          u.map(el => $("#channelTemplate").tmpl(el).appendTo("#list1"))
        }).then($("#wait").hide());
      },
        function (err) { console.error("Execute error", err); })
  }
  $("#first").click(() => authenticate().then(loadClient));
  $("#stat").click(() => execute())
})
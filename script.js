$(document).ready(()=>{
    var client_id="25550250520-rosegibeo5391nt58pehh9pkna2gv9qj.apps.googleusercontent.com";
    var api_key="AIzaSyCVjmtpRuWyqMUFy6S6QCrNVOluyM70Na8";
    function authenticate() {
        return gapi.auth2.getAuthInstance()
            .signIn({scope: "https://www.googleapis.com/auth/youtube.readonly"})
            .then(function() { console.log("Sign-in successful"); },
                  function(err) { console.error("Error signing in", err); });
      }
      function loadClient() {
        gapi.client.setApiKey(api_key);
        return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
            .then(function() { console.log("GAPI client loaded for API"); },
                  function(err) { console.error("Error loading GAPI client for API", err); });
      }
      gapi.load("client:auth2", function() {
        gapi.auth2.init({client_id: client_id});
      });

      chanalInfo= async function(id){
        t= await gapi.client.youtube.channels.list({
          "part": "snippet,contentDetails,statistics",
          "maxResults": 50,
          "id": id
        }).then(response=>response.result.items)
        return t
      }
    push= function(item){
      return {chanal:item.channelTitle,description:item.description_c,channelId:item.channelId,subscribers:item.subscriber_c,picture:item.picture_c,count:1,url:`https://www.youtube.com/channel/${item.channelId}`}
    }  
     var ff=function(items){
    u=[]
    items.map(  el=>{
      if(u.some(ii=>ii.channelId===el.snippet.channelId)){
        u.map(it=>it.channelId===el.snippet.channelId?it.count++:"")
      }
      else{
        aaa= push(el.snippet)
        u.push(aaa)
      }
    })
    u.sort((a,b)=>a.count<b.count?1:-1)
    return u
    }

      fragen=async function(j){
        it_u=[]
        npt=""
        params={"part": "snippet,contentDetails,statistics",
          "maxResults": 50,
          "myRating": "like",
          }
        for (i=0;i<j;i++){
          npt!=""?params.pageToken=npt:"";
          console.log(params)
          result=await gapi.client.youtube.videos.list(params).then(response=>response.result);
          npt=result.nextPageToken;     
          o=""
        result.items.map(el=>o+=el.snippet.channelId+",")
        c=await chanalInfo(o.substring(0,o.length-1));
         for(u=0;u<result.items.length;u++){
            c.map(ttt=>{
                if(ttt.id==result.items[u].snippet.channelId){
                    result.items[u].snippet.description_c=ttt.snippet.description
                    result.items[u].snippet.subscriber_c=ttt.statistics.subscriberCount
                    result.items[u].snippet.picture_c=ttt.snippet.thumbnails.default.url
                }
                
                })
          }
          result.items.map(y=>it_u.push(y))  
        }
    
        return it_u;
      }   
      function execute() {
        return fragen(5)
            .then(function(response) {
                    // Handle the results here (response.result has the parsed body).
                    s= ff(response)
                    s.forEach(element => element.persent=element.count*100/response.length);
                   s.map(t=>$("#list1").append(`<p>
                   <div class="row">
                   <div class="col-sm-4"><img src="${t.picture}" style="width:88px;height:88px;" class="rounded-circle" alt="Cinque Terre" width="304" height="236"> </div>
                   <div class="col-sm-8"> <h4 ><a href="${t.url}">${t.chanal} - ${t.count} лайков</h4></a><p>${t.subscribers} поодписчиков</p></div></div>
                      <div>${t.description}</div>
                      <div class="progress">
      <div class="progress-bar" role="progressbar" style="width: ${t.persent}%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">${parseInt(t.persent)}%</div>
    </div>
                      </p>`));
                        response.map(item=>$("#list").append(`<p>${item.snippet.title}</p>`))
                    
                  },
                  function(err) { console.error("Execute error", err); });
      }
      $("#first").click(()=> authenticate().then(loadClient));
      $("#stat").click(()=> execute())
})
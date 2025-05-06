<div class='screen' style='opacity:1.0;background:white;text-size:12pt'>
  <div style='width:50px;height:50px'>
    <svg id='#back' viewBox='0 0 50 50' width=50px height=50px style='position:absolute;left:0px;top:0px'>
      <rect style='opacity:0.0;' width=50px height=50px x=0 y=0 />
      <polygon points='17,25 33,35 33,15' style='fill:black;' />
    </svg>
  </div>

  <div style='bottom:0;left:0;'>

    <div style='width:94%;padding:7px;margin:10px;position:relative'>
      Daily reset N=1
      <svg id='reset_n' viewBox='-20 -10 40 20' width=40px style='float:right'>
        <rect   style='opacity:0.5' width=40px height=15px x=-20 y=-7.5 rx=7 ry=7 fill=#99ccff />
        <circle cx=10 cy=0 r=10 fill=#226699 />
      </svg>
    </div>

    <div id="#set_level" style='background:#99ccff;border-radius:5px;width:94%;margin:10px;padding:7px;position:relative' class='tappable'>
      <div class="inline-box">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M4 3v18l8.5-9L4 3zm9 0v18l8.5-9L13 3z"></path>
        </svg>
      </div>
      <span style="vertical-align: center;">Jump to level</span>
      <div id="#level_down" class="square-button">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="white" aria-hidden="true">
          <path d="M19 11H5v2h14v-2z"></path>
        </svg>
      </div>
      <span id="#level_num" style="vertical-align: center;">X</span>
      <div id="#level_up" class="square-button">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="white" aria-hidden="true">
          <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6v-2z"></path>
        </svg>
      </div>
    </div>

    <div id='#download_stats' style='background:#99ccff;border-radius:5px;width:94%;margin:10px;padding:7px;position:relative' class='tappable'>
      <p style='margin:auto'>
      <img src='/img/download.svg' height=20pt style='vertical-align:middle' />
      Export stats
      </p>
    </div>
    <label for='#upload_stats'>
      <div style='background:#99ccff;border-radius:5px;width:94%;margin:10px;padding:7px;position:relative;display:block' class='tappable'>
        <p style='margin:auto'>
        <img src='/img/upload.svg' height=20pt style='vertical-align:middle' />
        Restore stats
        </p>
      </div>
    </label>
    <div style='display:none'>
      <input id='#upload_stats' type='file' />
    </div>
    <div id='#clear_storage' style='background:#99ccff;border-radius:5px;width:94%;margin:10px;padding:7px;position:relative'  class='tappable'>
      <p style='margin:auto'>
      <img src='/img/remove.svg' height=20pt style='vertical-align:middle' />
      Clear local storage
      </p>
    </div>
  </div>
  <div style='position:absolute;bottom:4pt;left:4pt'>
    version 0.10.0
  </div>
</div>

<style>
.tappable {
    transform: translate3d(0,0,0);
    -webkit-transform: translate3d(0,0,0);
    background-color: #99ccff;
    -webkit-backface-visibility: hidden; /* Chrome, Safari, Opera */
    backface-visibility: hidden;
    -webkit-animation: pulse 0.3s linear 1;
    animation: pulse 0.3s linear 1;
    -webkit-animation-play-state: paused; /* Safari 4.0 - 8.0 */
    animation-play-state: paused;
}

/* Safari 4.0 - 8.0 */
@-webkit-keyframes pulse {
   0% {background-color: #99ccff;}
   5% {background-color: #3366cc;}
   95% {background-color: #3366cc;}
   100% {background-color: #99ccff;}
}

@keyframes pulse {
   0% {background-color: #99ccff;}
   5% {background-color: #3366cc;}
   95% {background-color: #3366cc;}
   100% {background-color: #99ccff;}
}

.square-button {
    width: 6vw; /* Adjust the size as per your requirement */
    height: 6vw; /* This ensures the square shape */
    background-color: #007bff; /* Button-like blue background */
    color: white; /* White text color */
    display: inline-flex;
    justify-content: center;
    vertical-align: middle;
    align-items: center;
    font-weight: bold;
    font-size: 2em; /* Adjust based on your size preference */
    border: none; /* Remove if you prefer the button to have a border */
    cursor: pointer; /* Changes the cursor to signify it's clickable */
    border-radius: 5px; /* Optional: for rounded corners */
    user-select: none; /* Prevents the user from selecting the content */
}

/* Additional styles for hover effect to make it more button-like */
.square-button:hover {
    background-color: #0056b3; /* Slightly darker shade on hover */
}

.inline-box {
    display: inline-flex;
    justify-content: center;
    vertical-align: middle;
    align-items: center;
    border: none; /* Remove if you prefer the button to have a border */
}
</style>

<div style='padding:0 8% 0 8%; top:0;left:0;width:100%;overflow:hidden'>
    <div style='width:100%;height:50px;'>
        <svg id='#back' viewBox='0 0 50 50' width=50px height=50px style='position:absolute;left:0;top:0'>
            <rect style='opacity:0.0;' width=50px height=50px x=0 y=0 />
            <polygon points='17,25 33,35 33,15' style='fill:black;' />
        </svg>
    </div>

    <div id='content'>
        <div id='levelhistdiv' style='padding:10px;border: 1px solid black;border-radius:8px;display:none'>
            <canvas id='level_v_time' width=100% height=80%></canvas>
        </div>
        <div style='width:100%;height:30px;'>
        </div>
        <div id='clickdelaydiv' style='padding:10px;border: 1px solid black;border-radius:8px;display:none'>
            <canvas id='avg_click_delay' width=100% height=80%></canvas>
        </div>
    </div>

</div>

<!--<script src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.bundle.min.js'></script>-->
<!-- Version 2.7.1 -->
<script src='/js/Chart.bundle.min.js'></script>
<script src='/js/mkcharts.js'></script>

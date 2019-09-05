<template>
    <div v-show="isOpened" class="radialMenu" :style="{width: size + 'px', height: size + 'px'}">
        <svg class="icons">
            <symbol id="return" viewBox="0 0 489.394 489.394">
                <path d="M375.789,92.867H166.864l17.507-42.795c3.724-9.132,1-19.574-6.691-25.744c-7.701-6.166-18.538-6.508-26.639-0.879L9.574,121.71c-6.197,4.304-9.795,11.457-9.563,18.995c0.231,7.533,4.261,14.446,10.71,18.359l147.925,89.823c8.417,5.108,19.18,4.093,26.481-2.499c7.312-6.591,9.427-17.312,5.219-26.202l-19.443-41.132h204.886c15.119,0,27.418,12.536,27.418,27.654v149.852c0,15.118-12.299,27.19-27.418,27.19h-226.74c-20.226,0-36.623,16.396-36.623,36.622v12.942c0,20.228,16.397,36.624,36.623,36.624h226.74c62.642,0,113.604-50.732,113.604-113.379V206.709C489.395,144.062,438.431,92.867,375.789,92.867z"></path>
            </symbol>
            <symbol id="close" viewBox="0 0 41.756 41.756">
                <path d="M27.948,20.878L40.291,8.536c1.953-1.953,1.953-5.119,0-7.071c-1.951-1.952-5.119-1.952-7.07,0L20.878,13.809L8.535,1.465c-1.951-1.952-5.119-1.952-7.07,0c-1.953,1.953-1.953,5.119,0,7.071l12.342,12.342L1.465,33.22c-1.953,1.953-1.953,5.119,0,7.071C2.44,41.268,3.721,41.755,5,41.755c1.278,0,2.56-0.487,3.535-1.464l12.343-12.342l12.343,12.343c0.976,0.977,2.256,1.464,3.535,1.464s2.56-0.487,3.535-1.464c1.953-1.953,1.953-5.119,0-7.071L27.948,20.878z"></path>
            </symbol>
        </svg>
        <svg class="menu" :class="{inner: menu.inner, outer: menu.outer}" :width="size" :height="size" viewBox="-50 -50 100 100" v-for="(menu, index) in openedMenu" :id="'lvl'+ menu.level">
            <g @click="$_sectorClick"  @mouseover="$_sectorHover" :class="{sector: sector.id, dummy: !sector.id, selected: menu.selectedIndex == sector.itemIndex}" v-for="(sector, index) in menu.sectors" :data-id="sector.id" :data-index="index" :transform="sector.transform" :data-item-index="sector.itemIndex">
                <path :d="sector.d"></path>
                <text v-if="sector.title" text-anchor="middle" font-size="38%" :x="sector.centerX" :y="sector.centerY" :transform="sector.textTransform">{{sector.title}}</text>
                <use v-if="sector.icon" :xlink:href="sector.icon" :x="sector.centerX" :y="sector.centerY" :transform="sector.useTransform" width="10" height="10" fill="white"></use>
            </g>
            <g class="center" @click="$_centerClick">
                <circle :r="menu.centerRadius"></circle>
                <use :xlink:href="menu.centerIcon" :transform="menu.centerTransform" :width="menu.centerSize" :height="menu.centerSize"></use>
            </g>
        </svg>
    </div>
</template>

<script src="./RadialMenu.js"></script>
<style src="./RadialMenu.css" scoped></style>
'use strict';

function Helper() {}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Helper.degToRad = deg => {
    return deg * (Math.PI / 180);
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Helper.getDegreePos = (angleDeg, length) => {
    return {
        x: Math.sin(Helper.degToRad(angleDeg)) * length,
        y: Math.cos(Helper.degToRad(angleDeg)) * length
    };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Helper.pointToString = point => {
    return Helper.numberToString(point.x) + ' ' + Helper.numberToString(point.y);
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Helper.numberToString = n => {
    if (Number.isInteger(n)) {
        return n.toString();
    } else if (n) {
        let r = (+n).toFixed(5);
        if (r.match(/\./)) {
            r = r.replace(/\.?0+$/, '');
        }
        return r;
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Helper.resolveLoopIndex = (index, length) => {
    if (index < 0) {
        index = length + index;
    }
    if (index >= length) {
        index = index - length;
    }
    if (index < length) {
        return index;
    } else {
        return null;
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Helper.waitForTransitionEnd = (node, propertyName) => {
    return new Promise(function (resolve) {
        function handler(event) {
            if (event.target == node && event.propertyName == propertyName) {
                node.removeEventListener('transitionend', handler);
                resolve();
            }
        }
        node.addEventListener('transitionend', handler);
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Helper.nextTick = fn => {
    setTimeout(fn, 15);
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Helper.getIndexOffset = (items, sectorCount) => {
    if (items.length < sectorCount) {
        switch (items.length) {
            case 1:
                return -2;
            case 2:
                return -2;
            case 3:
                return -2;
            default:
                return -1;
        }
    } else {
        return -1;
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
Helper.calcScale = (sectorSpace, sectorCount, radius) => {
    let totalSpace = sectorSpace * sectorCount;
    let circleLength = Math.PI * 2 * radius;
    let radiusDelta = radius - (circleLength - totalSpace) / (Math.PI * 2);
    return (radius - radiusDelta) / radius;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export default {
    name: 'RadialMenu',
    props: {
        menuItems   : Array,
        size        : Number,
        closeOnClick: Boolean
    },
    data: function () {
        return {
            isOpened  : false,
            openedMenu: []
        };
    },
    created: function () {
        this.radius      = 50;
        this.innerRadius = this.radius * 0.4;
        this.sectorSpace = this.radius * 0.06;
    },
    mounted: function () {
        document.addEventListener('keydown', this.$_keyDown.bind(this));
        document.addEventListener('wheel', this.$_mouseWheel.bind(this));
    },
    beforeDestroy: function () {
        document.removeEventListener('keydown', this.$_keyDown);
        document.removeEventListener('wheel', this.$_mouseWheel);
    },
    methods: {
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        open: function () {
            if (!this.isOpened) {
                this.isOpened = true;
                let layerInfo = this.$_createMenuLayer(this.menuItems, 0);
                this.openedMenu.push(layerInfo);
                Helper.nextTick(function () {
                    layerInfo.inner = false;
                })
            }
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        close: function () {
            if (this.isOpened) {
                let currentMenu = this.$_getCurrentMenu();
                let node = document.getElementById('lvl' + currentMenu.level);
                Helper.waitForTransitionEnd(node, 'visibility').then(() => {
                    this.openedMenu = [];
                    this.isOpened = false;
                });
                currentMenu.inner = true;
            }
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        $_mouseWheel: function (event) {
            if (this.isOpened) {
                let delta = -event.deltaY;
                if (delta > 0) {
                    this.$_selectDelta(1);
                } else {
                    this.$_selectDelta(-1);
                }
            }
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        $_keyDown: function (event) {
            if (this.isOpened) {
                switch (event.key) {
                    case 'Escape':
                    case 'Backspace':
                        this.$_centerClick();
                        event.preventDefault();
                        break;
                    case 'Enter':
                        this.$_menuClick(this.$_getSelectedItem());
                        event.preventDefault();
                        break;
                    case 'ArrowRight':
                    case 'ArrowUp':
                        this.$_selectDelta(1);
                        event.preventDefault();
                        break;
                    case 'ArrowLeft':
                    case 'ArrowDown':
                        this.$_selectDelta(-1);
                        event.preventDefault();
                        break;
                }
            }
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        $_createMenuLayer: function (items, level) {
            let info = {
                inner        : true,
                outer        : false,
                level        : level,
                levelItems   : items,
                sectors      : [],
                selectedIndex: 0
            };
            let sectorCount = Math.max(items.length, 6);
            let scale = Helper.calcScale(this.sectorSpace, sectorCount, this.radius);

            let angleStep   = 360 / sectorCount;
            let angleShift  = angleStep / 2 + 270;
            let indexOffset = Helper.getIndexOffset(items, sectorCount);

            for (let i = 0; i < sectorCount; ++i) {
                let startAngle = angleShift + angleStep * i;
                let endAngle   = angleShift + angleStep * (i + 1);
                let itemIndex = Helper.resolveLoopIndex(sectorCount - i + indexOffset, sectorCount);
                let item;
                if (itemIndex >= 0 && itemIndex < items.length) {
                    item = items[itemIndex];
                } else {
                    item = null;
                }
                let sector = this.$_createSector(startAngle, endAngle, scale, item);
                sector.itemIndex = itemIndex;
                info.sectors.push(sector);
            }

            info.centerRadius = this.innerRadius - this.sectorSpace / 3;
            info.centerSize = level > 0 ? 8 : 7;
            info.centerIcon = level > 0 ? '#return' : '#close';
            info.centerTransform = 'translate(-' + Helper.numberToString(info.centerSize / 2) + ',-' + Helper.numberToString(info.centerSize / 2) + ')';
            return info;
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        $_centerClick: function (event) {
            if (this.openedMenu.length > 1) {
                let childMenu = this.$_getCurrentMenu();
                let parentMenu = this.openedMenu[this.openedMenu.length - 2];
                let svgNode = document.getElementById('lvl' + childMenu.level);
                Helper.waitForTransitionEnd(svgNode, 'visibility').then(() => {
                    this.openedMenu.pop();
                });
                childMenu.inner = true;
                parentMenu.outer = false;
            } else {
                this.close();
            }
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        $_getCurrentMenu: function () {
            return this.openedMenu[this.openedMenu.length - 1];
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        $_sectorHover: function (event) {
            if (event.target.parentNode.classList.contains('sector')) {
                let dataset = event.target.parentNode.dataset;
                if (dataset.itemIndex !== undefined) {
                    let currentMenu = this.$_getCurrentMenu();
                    currentMenu.selectedIndex = parseInt(dataset.itemIndex);
                }
            }
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        $_getSelectedItem: function () {
            let currentMenu = this.$_getCurrentMenu();
            return currentMenu.levelItems[currentMenu.selectedIndex];
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        $_selectDelta: function (indexDelta) {
            let currentMenu = this.$_getCurrentMenu();
            let selectedIndex = currentMenu.selectedIndex + indexDelta;
            if (selectedIndex < 0) {
                selectedIndex = currentMenu.levelItems.length + selectedIndex;
            } else if (selectedIndex >= currentMenu.levelItems.length) {
                selectedIndex -= currentMenu.levelItems.length;
            }
            currentMenu.selectedIndex = selectedIndex;
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        $_menuClick: function (item) {
            if (item.items) {
                this.$_openNestedMenu(item);
            } else {
                this.$emit('clicked', item);
                if (this.closeOnClick) {
                    this.close();
                }
            }
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        $_sectorClick: function (event) {
            if (event.target.parentNode.classList.contains('sector')) {
                let dataset = event.target.parentNode.dataset;
                let currentMenu = this.$_getCurrentMenu();
                if (dataset.itemIndex !== undefined) {
                    let item = currentMenu.levelItems[dataset.itemIndex];
                    //console.log('sector click:', item);
                    this.$_menuClick(item);
                }
            }
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        $_openNestedMenu: function (item) {
            let parentMenu = this.$_getCurrentMenu();
            let newMenu = this.$_createMenuLayer(item.items, this.openedMenu.length);
            parentMenu.outer = true;
            this.openedMenu.push(newMenu);
            Helper.nextTick(function () {
                newMenu.inner = false;
            });
        },


        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        $_createSector: function (startAngleDeg, endAngleDeg, scale, item) {
            let info = {};
            let centerPoint = this.$_getSectorCenter(startAngleDeg, endAngleDeg);
            info.centerX = Helper.numberToString(centerPoint.x);
            info.centerY = Helper.numberToString(centerPoint.y);

            let translate = {
                x: Helper.numberToString((1 - scale) * centerPoint.x),
                y: Helper.numberToString((1 - scale) * centerPoint.y)
            };
            info.transform = 'translate(' + translate.x + ',' + translate.y + ') scale(' + scale + ')';
            info.d = this.$_getSectorPathCmd(startAngleDeg, endAngleDeg, scale);

            if (item) {
                info.className = 'sector';
                info.id = item.id;

                if (item.title) {
                    info.title = item.title;
                    if (item.icon) {
                        info.textTransform = 'translate(0,8)';
                    } else {
                        info.textTransform = 'translate(0,2)';
                    }
                }

                if (item.icon) {
                    info.icon = item.icon;
                    if (item.title) {
                        info.useTransform = 'translate(-5,-8)';
                    } else {
                        info.useTransform = 'translate(-5,-5)';
                    }
                }
            }
            return info;
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        $_getSectorPathCmd: function (startAngleDeg, endAngleDeg, scale) {
            let initPoint = Helper.getDegreePos(startAngleDeg, this.radius);
            let path = 'M' + Helper.pointToString(initPoint);

            let radiusAfterScale = this.radius * (1 / scale);
            path += 'A' + radiusAfterScale + ' ' + radiusAfterScale + ' 0 0 0' + Helper.pointToString(Helper.getDegreePos(endAngleDeg, this.radius));
            path += 'L' + Helper.pointToString(Helper.getDegreePos(endAngleDeg, this.innerRadius));

            let radiusDiff = this.radius - this.innerRadius;
            let radiusDelta = (radiusDiff - (radiusDiff * scale)) / 2;
            let innerRadius = (this.innerRadius + radiusDelta) * (1 / scale);
            path += 'A' + innerRadius + ' ' + innerRadius + ' 0 0 1 ' + Helper.pointToString(Helper.getDegreePos(startAngleDeg, this.innerRadius));
            path += 'Z';

            return path;
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        $_getSectorCenter: function (startAngleDeg, endAngleDeg) {
            return Helper.getDegreePos((startAngleDeg + endAngleDeg) / 2, this.innerRadius + (this.radius - this.innerRadius) / 2);
        }
    }
}
; (function (window, undefine) {
    /*
    *   DateTime constructor
    *   Parameters:
    *       value   yyyy-MM-dd hh:mm:ss or MM/dd/yyyy hh:mm:ss
    */
    function DateTime(value) {
        if (value instanceof Date) {
            this.value = value;
        }
        else {
            this.value = new Date(value);
        }
        this.year = this.value.getFullYear();
        this.month = this.value.getMonth() + 1;
        this.day = this.value.getDate();
        this.dayOfWeek = this.value.getDay();
        this.dayOfYear = Math.ceil((this.value.getTime() - new Date(this.value.getFullYear(), 0, 1, 0, 0, 0, 0).getTime()) / 86400000);
        this.hour = this.value.getHours();
        this.minute = this.value.getMinutes();
        this.second = this.value.getSeconds();
        this.millisecond = this.value.getMilliseconds();
    };
    DateTime.now = function () {
        return new DateTime(new Date());
    };
    DateTime.diff = function (date1, date2) {
        return new TimeSpan(date1 - date2);
    };

    (function (p) {
        p.date = function () {
            return new DateTime(new Date(this.value.getFullYear(), this.value.getMonth(), this.value.getDate(), 0, 0, 0, 0));
        };
        p.addYears = function (value) {
            var newDate = new Date(this.value);
            return newDate.setFullYear(this.value.getFullYear() + value) ? new DateTime(newDate) : NaN;
        };
        p.addDays = function (value) {
            return this.addHours(value * 24);
        };
        p.addHours = function (value) {
            return this.addMinutes(value * 60);
        };
        p.addMinutes = function (value) {
            return this.addSeconds(value * 60);
        };
        p.addSeconds = function (value) {
            return this.addMilliseconds(value * 1000);
        };
        p.addMilliseconds = function (value) {
            return new DateTime(new Date(this.value.getTime() + value));
        };
        p.diff = function (value) {
            return DateTime.diff(this, value);
        };

        p.valueOf = function () {
            return this.value.valueOf();
        };
        p.toString = function (format) {
            if (this.value == null) {
                return null;
            }
            if (typeof format === 'string') {
                var pc = new ParamContainer();
                var r = getStandardFormat(format, pc);

                r = r.replace(/yyyy?/g, this.year);
                r = r.replace(/yy/g, this.year % 100);

                r = r.replace(/MMMM+/g, pc.push(getMonthName(this.month)).name);
                r = r.replace(/MMM/g, pc.push(getMonthName(this.month).substring(0, 3)).name);
                r = r.replace(/MM/g, (this.month > 9 ? '' : '0') + this.month);
                r = r.replace(/M/g, this.month);

                r = r.replace(/(dd)dd+/g, pc.push(getDayOfMonthSuffix(this.day)).name);
                r = r.replace(/(d)dd/g, pc.push(getDayOfMonthSuffix(this.day)).name);
                r = r.replace(/dd/g, (this.day > 9 ? '' : '0') + this.day);
                r = r.replace(/d/g, this.day);

                r = r.replace(/HH/g, (this.hour > 9 ? '' : '0') + this.hour);
                r = r.replace(/H/g, this.hour);

                r = r.replace(/hh/g, (this.hour % 12 > 9 ? '' : '0') + (this.hour % 12 == 0 ? 12 : this.hour % 12));
                r = r.replace(/h/g, this.hour % 12 == 0 ? 12 : this.hour % 12);

                r = r.replace(/mm/g, (this.minute > 9 ? '' : '0') + this.minute);
                r = r.replace(/m/g, this.minute);

                r = r.replace(/ss/g, (this.second > 9 ? '' : '0') + this.second);
                r = r.replace(/s/g, this.second);

                r = r.replace(/fff/g, (this.millisecond > 99 ? '' : (this.millisecond > 9 ? '0' : '00')) + this.millisecond);
                r = r.replace(/ff/g, (this.millisecond / 10 > 9 ? '' : '0') + Math.round(this.millisecond / 10));
                r = r.replace(/f/g, Math.round(this.millisecond / 100));

                r = r.replace(/tt+/g, this.hour < 12 ? 'AM' : 'PM');
                r = r.replace(/t/g, this.hour < 12 ? 'A' : 'P');

                r = r.replace(/WWWW+/g, getDayOfWeekName(this.dayOfWeek));
                r = r.replace(/WWW/g, getDayOfWeekName(this.dayOfWeek).substring(0, 3));
                r = r.replace(/WW/g, getDayOfWeekName(this.dayOfWeek).substring(0, 2));

                for (var i = pc.pop() ; i ; i = pc.pop()) {
                    r = r.replace(i.name, i.value);
                }

                return r;
            }
            return this.value.toString();
        };

        // private classes
        function ParamContainer() {
            this.params = [];
        }
        ParamContainer.prototype.push = function (data) {
            var dataObj = { name: '{^#' + this.params.length + '$}', value: data };
            this.params.push(dataObj);
            return dataObj;
        };
        ParamContainer.prototype.pop = function () {
            return this.params.pop();
        };

        // private functions
        function getStandardFormat(format, pc) {
            switch (format) {
                case 'd': return 'M/d/yyyy';
                case 'D': return 'WWWW, MMMM dd, yyyy';
                case 'f': return 'WWWW, MMMM dd, yyyy h:mm tt';
                case 'F': return 'WWWW, MMMM dd, yyyy h:mm:ss tt';
                case 'g': return 'M/d/yyyy h:mm tt';
                case 'G': return 'M/d/yyyy h:mm:ss tt';
                case 'm': return 'MMMM dd';
                case 'o': return 'yyyy-MM-ddTHH:mm:ss.fff';
                case 'R': return 'WWW, dd MMM yyyy H:mm:ss ' + pc.push('GMT').name;
                case 's': return 'yyyy-MM-ddTHH:mm:ss';
                case 't': return 'h:mm tt';
                case 'T': return 'h:mm:ss tt';
                case 'u': return 'yyyy-MM-dd H:mm:ssZ';
                case 'U': return 'WWWW, MMMM dd, yyyy h:mm:ss tt';
                case 'y': return 'MMMM, yyyy';
                default: return format;
            }
        }

        function getMonthName(month) {
            switch (month) {
                case 1: return 'January';
                case 2: return 'February';
                case 3: return 'March';
                case 4: return 'April';
                case 5: return 'May';
                case 6: return 'June';
                case 7: return 'July';
                case 8: return 'August';
                case 9: return 'September';
                case 10: return 'October';
                case 11: return 'November';
                case 12: return 'December';
                default: return '';
            }
        }

        function getDayOfMonthSuffix(day) {
            switch (day) {
                case 1, 21, 31: return 'st';
                case 2, 22: return 'nd';
                case 3, 23: return 'rd';
                default: return 'th';
            }
        }

        function getDayOfWeekName(day) {
            switch (day) {
                case 0: return 'Sunday';
                case 1: return 'Monday';
                case 2: return 'Tuesday';
                case 3: return 'Wednesday';
                case 4: return 'Thursday';
                case 5: return 'Friday';
                case 6: return 'Saturday';
                default: return '';
            }
        }

    })(DateTime.prototype);


    /*
    *   TimeSpan
    */
    function TimeSpan(value) {
        if (typeof value === 'number') {
            if (!(value > 0 || value < 0)) {
                value = 0;
            }
            this.value = value;
        } else if (typeof value === 'string') {
            var re = value.match(/^(?:(\d+)[\.\:])?([012]\d)\:([0-5]?\d)\:([0-5]?\d)(?:\.(\d{1,3}))?$/);
            if (re) {
                var days = re[1] ? +re[1] : 0;
                var hours = +re[2];
                var minutes = +re[3];
                var seconds = +re[4];
                var milliseconds = re[5] ? (+re[5] * Math.pow(10, 3 - re[5].length)) : 0;
                this.value = (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000 + milliseconds;
            } else {
                this.value = 0;
            }
        } else if (typeof value === 'object' && value instanceof TimeSpan) {
            this.value = value.value;
        } else {
            this.value = 0;
        }

        this.totalMilliseconds = this.value;
        this.totalSeconds = this.totalMilliseconds / 1000;
        this.totalMinutes = this.totalSeconds / 60;
        this.totalHours = this.totalMinutes / 60;
        this.totalDays = this.totalHours / 24;

        this.milliseconds = this.value % 1000;
        this.seconds = Math.floor(this.totalSeconds) % 60;
        this.minutes = Math.floor(this.totalMinutes) % 60;
        this.hours = Math.floor(this.totalHours) % 24;
        this.days = Math.floor(this.totalDays);

        (function (p) {
            p.valueOf = function () {
                return this.value.valueOf();
            };
            p.toString = function (format) {
                if (this.value == null) {
                    return null;
                }
                if (typeof format === 'string') {
                    var r = format;

                    r = r.replace(/d/g, Math.abs(this.days));

                    r = r.replace(/hh/g, (Math.abs(this.hours) > 9 ? '' : '0') + Math.abs(this.hours));
                    r = r.replace(/h/g, Math.abs(this.hours));

                    r = r.replace(/mm/g, (Math.abs(this.minutes) > 9 ? '' : '0') + Math.abs(this.minutes));
                    r = r.replace(/m/g, Math.abs(this.minutes));

                    r = r.replace(/ss/g, (Math.abs(this.seconds) > 9 ? '' : '0') + Math.abs(this.seconds));
                    r = r.replace(/s/g, Math.abs(this.seconds));

                    r = r.replace(/fff/g, (Math.abs(this.milliseconds) > 99 ? '' : (Math.abs(this.milliseconds) > 9 ? '0' : '00')) + Math.abs(this.milliseconds));
                    r = r.replace(/ff/g, (Math.abs(this.milliseconds) / 10 > 9 ? '' : '0') + Math.round(Math.abs(this.milliseconds) / 10));
                    r = r.replace(/f/g, Math.round(Math.abs(this.milliseconds) / 100));

                    if (value < 0) {
                        r = '-' + r;
                    }
                    return r;
                }
                return this.days == 0 ? p.toString.call(this, 'hh:mm:ss.fff') : p.toString.call(this, 'd.hh:mm:ss.fff');
            }

        })(TimeSpan.prototype);
    }
    window.DateTime = DateTime;
    window.TimeSpan = TimeSpan;
})(window);

/* utils.js
 * Credit given where it is due
 */
 
 
/* Credit to Frank: http://stackoverflow.com/users/1957928/frank 
 * http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery/34842797#34842797
 */
 String.prototype.hashCode = function() {

    if (Array.prototype.reduce) {
        return this.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);   
    } else {

        var hash = 0, i, chr, len;
        if (this.length == 0) return hash;
        for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }
};

function hoursToMillis(hours) {
    return hours * 3600000;
}
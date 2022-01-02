
String.prototype.toCamelCase = function(s) {
    return this.toLowerCase()
        .replace(/^./, (m) => m[0].toUpperCase())
        .replace(/_(\w)/g, (m) => m[1].toUpperCase())
        .replace('_', '');
    }
        

String.prototype.toSnakeCase = function(s) {
    let result = this.replace( /([A-Z])/g, " $1" );
    result = result.split(' ').join('_').toLowerCase();
    if(result.charAt(0) == '_') {
        result = result.substring(1);
    }
    if(result.charAt(result.length-1) == '_') {
        result = result.slice(0, -1);
    }
    return result;
}


String.prototype.toSlug = function(s) {
    const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
    const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
    const p = new RegExp(a.split('').join('|'), 'g')
  
    return this.toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
      .replace(/&/g, '-and-') // Replace & with 'and'
      .replace(/[^\w\-]+/g, '') // Remove all non-word characters
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
}
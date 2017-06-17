//JSON with regex
export const replacerJSON = (key, value) => {
  if (value instanceof RegExp)
    return ("__REGEXP " + value.toString());
  else
    return value;
}

//JSON with regex
export const reviverJSON = (key, value) => {
  if(value!=null) {
    if (value.toString().indexOf("__REGEXP ") == 0) {
      const m = value.split("__REGEXP ")[1].match(/\/(.*)\/(.*)?/);
      return new RegExp(m[1], m[2] || "");
    }
  }
  return value
}

export const cancelObs = (obs) => {
  obs.next(null);
  obs.complete();
};

export const okObs = (obs, data=[]) => {
  obs.next(data);
  obs.complete();
};

export const failObs = (obs) => {
  this.okObs(obs, [null]);
};

export const isOk = (data) => {
  if(data==null)
    return false;
  if(!Array.isArray(data))
    return false;
  if(data.length==1 && data[0]==null)
    return false;
  return true;
};
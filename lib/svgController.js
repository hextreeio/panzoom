//module.exports = makeSvgController;
export default makeSvgController;
//module.exports.canAttach = isSVGElement;
//export const

function makeSvgController(svgElement, options) {
  if (!isSVGElement(svgElement)) {
    throw new Error("svg element is required for svg.panzoom to work");
  }

  var owner = svgElement.ownerSVGElement;
  if (!owner) {
    throw new Error(
      "Do not apply panzoom to the root <svg> element. " +
        "Use its child instead (e.g. <g></g>). " +
        "As of March 2016 only FireFox supported transform on the root element"
    );
  }

  if (!options.disableKeyboardInteraction) {
    owner.setAttribute("tabindex", 0);
  }

  var api = {
    getBBox: getBBox,
    getScreenCTM: getScreenCTM,
    getOwner: getOwner,
    applyTransform: applyTransform,
    initTransform: initTransform,
  };

  return api;

  function getOwner() {
    return owner;
  }

  function getBBox() {
    var bbox = svgElement.getBBox();
    return {
      left: bbox.x,
      top: bbox.y,
      width: bbox.width,
      height: bbox.height,
    };
  }

  function getScreenCTM() {
    var ctm = owner.getCTM();
    if (!ctm) {
      // This is likely firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=873106
      // The code below is not entirely correct, but still better than nothing
      return owner.getScreenCTM();
    }
    return ctm;
  }

  function initTransform(transform) {
    var screenCTM = svgElement.getCTM();

    // The above line returns null on Firefox
    if (screenCTM === null) {
      screenCTM = document
        .createElementNS("http://www.w3.org/2000/svg", "svg")
        .createSVGMatrix();
    }

    transform.x = screenCTM.e;
    transform.y = screenCTM.f;
    transform.scale = screenCTM.a;
    owner.removeAttributeNS(null, "viewBox");
  }

  function applyTransform(transform) {
    svgElement.setAttribute(
      "transform",
      "matrix(" +
        transform.scale.toFixed(4) +
        " 0 0 " +
        transform.scale.toFixed(4) +
        " " +
        transform.x.toFixed(4) +
        " " +
        transform.y.toFixed(4) +
        ")"
    );
  }
}

function isSVGElement(element) {
  return element && element.ownerSVGElement && element.getCTM;
}

makeSvgController.canAttach = isSVGElement;

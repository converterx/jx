document.getElementById("jsonToXml").addEventListener("click", function () {
  const input = document.getElementById("inputData").value;
  try {
    const json = JSON.parse(input);
    const xml = jsonToXml(json);
    document.getElementById("outputData").value = formatXml(xml);
  } catch (error) {
    alert("Enter valid JSON format.");
  }
});

document.getElementById("xmlToJson").addEventListener("click", function () {
  const input = document.getElementById("inputData").value;
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(input, "text/xml");
    if (xmlDoc.getElementsByTagName("parsererror").length) {
      throw new Error("Enter valid XML format.");
    }
    const json = xmlToJson(xmlDoc.documentElement);
    document.getElementById("outputData").value = JSON.stringify(json, null, 2);
  } catch (error) {
    alert("Enter valid XML format.");
  }
});

function jsonToXml(json) {
  let xml = '';
  for (const prop in json) {
    if (json.hasOwnProperty(prop)) {
      const value = json[prop];
      xml += `<${prop}>`;
      if (typeof value === 'object') {
        xml += jsonToXml(value);
      } else {
        xml += value;
      }
      xml += `</${prop}>`;
    }
  }
  return xml;
}

function xmlToJson(node) {
  let obj = {};
  if (node.nodeType === 1) {
    if (node.attributes.length > 0) {
      obj["@attributes"] = {};
      for (let j = 0; j < node.attributes.length; j++) {
        const attribute = node.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (node.nodeType === 3) {
    obj = node.nodeValue;
  }

  if (node.hasChildNodes()) {
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes.item(i);
      const nodeName = child.nodeName;
      if (typeof obj[nodeName] === "undefined") {
        obj[nodeName] = xmlToJson(child);
      } else {
        if (typeof obj[nodeName].push === "undefined") {
          obj[nodeName] = [obj[nodeName]];
        }
        obj[nodeName].push(xmlToJson(child));
      }
    }
  }
  return obj;
}

function formatXml(xml) {
  let formatted = '';
  const reg = /(>)(<)(\/*)/g;
  xml = xml.replace(reg, '$1\r\n$2$3');
  let pad = 0;
  xml.split('\r\n').forEach(node => {
    let indent = 0;
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (node.match(/^<\/\w/)) {
      if (pad !== 0) {
        pad -= 1;
      }
    } else if (node.match(/^<\w([^>]*[^\/])?>.*$/)) {
      indent = 1;
    } else {
      indent = 0;
    }

    const padding = new Array(pad + 1).join('  ');
    formatted += padding + node + '\r\n';
    pad += indent;
  });
  return formatted.trim();
}

// DHCR Auto-Fill — reads building data from window.name
// (set by rent-stabilized-nyc.fly.dev) and fills the search form.
(function () {
  try {
    var d = JSON.parse(window.name);
    if (!d || !d._rsnyc) return;

    // Street type: full name → common abbreviations used by DHCR
    var streetTypeMap = {
      "STREET": ["STREET", "ST", "STR"],
      "AVENUE": ["AVENUE", "AVE", "AV"],
      "ROAD": ["ROAD", "RD"],
      "PLACE": ["PLACE", "PL"],
      "DRIVE": ["DRIVE", "DR"],
      "BOULEVARD": ["BOULEVARD", "BLVD"],
      "COURT": ["COURT", "CT"],
      "LANE": ["LANE", "LN"],
      "WAY": ["WAY"],
      "TERRACE": ["TERRACE", "TER", "TERR"],
      "PLAZA": ["PLAZA", "PLZ"],
      "PARKWAY": ["PARKWAY", "PKWY", "PKY"],
      "CIRCLE": ["CIRCLE", "CIR"],
      "TURNPIKE": ["TURNPIKE", "TPKE"],
      "HIGHWAY": ["HIGHWAY", "HWY"],
      "EXPRESSWAY": ["EXPRESSWAY", "EXPY"],
      "CONCOURSE": ["CONCOURSE", "CONC"],
      "WALK": ["WALK"],
      "LOOP": ["LOOP"],
      "SLIP": ["SLIP"],
      "ALLEY": ["ALLEY", "ALY"],
      "PATH": ["PATH"],
      "SQUARE": ["SQUARE", "SQ"],
      "CRESCENT": ["CRESCENT", "CRES"],
      "ROW": ["ROW"]
    };

    function setTextField(labelText, value) {
      if (!value) return;
      var el = findFieldByLabel(labelText);
      if (el) el.value = value;
    }

    function setDropdown(labelText, value) {
      if (!value) return;
      var el = findFieldByLabel(labelText);
      if (!el || el.tagName !== "SELECT") return;

      var upper = value.toUpperCase().trim();

      // Build list of all possible variants to try
      var variants = [upper];
      if (streetTypeMap[upper]) {
        variants = variants.concat(streetTypeMap[upper]);
      }
      // Also try reverse lookup (if value is an abbreviation, find all variants)
      for (var key in streetTypeMap) {
        var abbrevs = streetTypeMap[key];
        for (var a = 0; a < abbrevs.length; a++) {
          if (abbrevs[a] === upper) {
            variants = variants.concat(abbrevs);
            variants.push(key);
          }
        }
      }

      // Try each option against each variant (case-insensitive)
      for (var j = 0; j < el.options.length; j++) {
        var optText = el.options[j].text.toUpperCase().trim();
        var optVal = el.options[j].value.toUpperCase().trim();
        if (!optText && !optVal) continue;
        for (var v = 0; v < variants.length; v++) {
          var variant = variants[v].toUpperCase();
          if (optText === variant || optVal === variant) {
            el.selectedIndex = j;
            el.dispatchEvent(new Event("change", { bubbles: true }));
            return;
          }
        }
      }

      // Last resort: partial/contains match
      for (var j = 0; j < el.options.length; j++) {
        var optText = el.options[j].text.toUpperCase().trim();
        if (!optText) continue;
        if (optText.indexOf(upper) > -1 || upper.indexOf(optText) > -1) {
          el.selectedIndex = j;
          el.dispatchEvent(new Event("change", { bubbles: true }));
          return;
        }
      }
    }

    function findFieldByLabel(labelText) {
      var labels = document.querySelectorAll("label");
      for (var i = 0; i < labels.length; i++) {
        var text = labels[i].textContent.trim().replace(":", "");
        if (text.indexOf(labelText) > -1) {
          var id = labels[i].getAttribute("for");
          if (id) return document.getElementById(id);
        }
      }
      return null;
    }

    function fillForm() {
      setTextField("Street House Number", d.n);
      setTextField("Street Name", d.s);
      setDropdown("Street Type", d.t);
      setDropdown("County", d.c);
      if (d.dp) setDropdown("Street Direction Prefix", d.dp);
    }

    // Fill immediately
    fillForm();

    // Retry after a short delay in case dropdowns load asynchronously
    setTimeout(fillForm, 500);
    setTimeout(fillForm, 1500);

    // Clear data so it doesn't re-fill on manual refresh
    window.name = "";

    // Success banner
    var banner = document.createElement("div");
    banner.style.cssText =
      "position:fixed;top:0;left:0;right:0;background:#f59e0b;color:#000;text-align:center;padding:10px;z-index:9999;font:bold 14px sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.3)";
    banner.textContent = "Form auto-filled from NYC Rent Stabilized!";
    document.body.appendChild(banner);
    setTimeout(function () {
      banner.remove();
    }, 4000);
  } catch (e) {
    // No data or invalid JSON — do nothing
  }
})();

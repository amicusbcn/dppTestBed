import fallbackData from "../data/batteryDpp.json";

const RAW_AAS_URL = import.meta.env.VITE_AAS_BASE_URL || "http://158.158.54.56:8081";
const AAS_BASE_URL =
  typeof window !== "undefined" &&
  window.location.protocol === "https:" &&
  RAW_AAS_URL.startsWith("http://")
    ? "/api/aas"
    : RAW_AAS_URL;

function getTextVal(el, lang = "es", fallback = undefined) {
  if (!el || el.value === undefined || el.value === null) return fallback;
  if (typeof el.value === "string") return el.value !== "" ? el.value : fallback;
  if (Array.isArray(el.value) && el.value.length > 0) {
    const preferred = el.value.find((v) => v.language === lang);
    if (preferred?.text) return preferred.text;
    const es = el.value.find((v) => v.language === "es");
    if (es?.text) return es.text;
    const en = el.value.find((v) => v.language === "en");
    if (en?.text) return en.text;
    return el.value[0]?.text || fallback;
  }
  return fallback;
}

function findEl(elements = [], idShort) {
  return elements.find((el) => el.idShort === idShort);
}

function getPropVal(elements = [], idShort, fallback = undefined) {
  const el = findEl(elements, idShort);
  if (!el || el.value === undefined || el.value === null || el.value === "") {
    return fallback;
  }
  if (["xs:float", "xs:double", "xs:decimal"].includes(el.valueType)) {
    const num = Number(el.value);
    return Number.isNaN(num) ? fallback : num;
  }
  if (["xs:integer", "xs:unsignedInt"].includes(el.valueType)) {
    const num = parseInt(el.value, 10);
    return Number.isNaN(num) ? fallback : num;
  }
  if (el.valueType === "xs:boolean") {
    return el.value === "true" || el.value === true;
  }
  return el.value;
}

const CATEGORY_LABELS = {
  lmt: "Movilidad Ligera (LMT · e-Bike)",
  ev: "Vehículo Eléctrico (EV)",
  industrial: "Batería Industrial",
  stationary: "Almacenamiento Estacionario (SB)",
};

const TARGET_2031_SHARES = {
  cobalt: 16,
  lithium: 6,
  nickel: 6,
};

const MATERIAL_LABELS_ES = {
  cobalt: "Cobalto (Co)",
  lithium: "Litio (Li)",
  nickel: "Níquel (Ni)",
};

export async function fetchBatteryDpp(lang = "es") {
  if (!AAS_BASE_URL) {
    return { data: fallbackData, source: "local", mappedFields: [] };
  }

  try {
    const res = await fetch(`${AAS_BASE_URL}/submodels`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const payload = await res.json();
    const submodels = Array.isArray(payload) ? payload : payload.result || [];

    if (submodels.length === 0) {
      return { data: fallbackData, source: "local", mappedFields: [] };
    }

    const mappedFields = new Set();
    const mark = (key) => mappedFields.add(key);

    const smNameplate = submodels.find((s) => s.idShort === "Nameplate");
    const smCarbon = submodels.find((s) => s.idShort === "CarbonFootprint");
    const smDocs = submodels.find((s) => s.idShort === "HandoverDocumentation");
    const smTech = submodels.find((s) => s.idShort === "TechnicalData");
    const smCond = submodels.find((s) => s.idShort === "ProductCondition");
    const smMat = submodels.find((s) => s.idShort === "MaterialComposition");
    const smCirc = submodels.find((s) => s.idShort === "Circularity");
    const smDue = submodels.find((s) => s.idShort === "SupplyChainDueDiligence");

    const mapped = structuredClone(fallbackData);

    // 1. NAMEPLATE
    if (smNameplate?.submodelElements) {
      const els = smNameplate.submodelElements;
      const mfgName = getTextVal(findEl(els, "ManufacturerName"), lang);
      if (mfgName) {
        mapped.submodels.public_nameplate.manufacturer = mfgName;
        mark("nameplate.manufacturer");
      }
      const prodName = getTextVal(findEl(els, "ManufacturerProductDesignation"), lang);
      if (prodName) {
        mapped.submodels.public_nameplate.product_name = prodName;
        mark("nameplate.product_name");
      }
      const serial = getPropVal(els, "SerialNumber");
      if (serial !== undefined) {
        mapped.battery_id = serial;
        mark("battery_id");
      }
      const mfgDate = getPropVal(els, "DateOfManufacture");
      if (mfgDate !== undefined) {
        mapped.submodels.public_nameplate.manufacturing_date = mfgDate;
        mark("nameplate.manufacturing_date");
      }
      const country = getPropVal(els, "CountryOfOrigin");
      if (country) {
        mapped.submodels.public_nameplate.manufacturing_plant = `Planta de Ensamblaje (${country})`;
        mark("nameplate.manufacturing_plant");
      }
      const opRole = getTextVal(findEl(els, "OperatorRole"), lang);
      if (opRole) {
        mapped.responsible_operator.role = opRole;
        mark("responsible_operator.role");
      }
      const heavyMetals = getTextVal(findEl(els, "HeavyMetalsDeclaration"), lang);
      if (heavyMetals) {
        mapped.submodels.public_nameplate.heavy_metals_declaration = heavyMetals;
        mark("nameplate.heavy_metals_declaration");
      }
    }

    // 2. TECHNICAL DATA
    if (smTech?.submodelElements) {
      const genInfo = findEl(smTech.submodelElements, "GeneralInformation")?.value || [];
      const opName = getTextVal(findEl(genInfo, "ManufacturerName"), lang);
      if (opName) {
        mapped.responsible_operator.name = opName;
        mark("responsible_operator.name");
      }
      const opId = getPropVal(genInfo, "ManufacturerIdentifier");
      if (opId) {
        mapped.responsible_operator.eori_vat = opId;
        mark("responsible_operator.eori_vat");
      }
      const mass = getPropVal(genInfo, "BatteryMass");
      if (mass !== undefined) {
        mapped.submodels.public_nameplate.weight_kg = mass;
        mark("nameplate.weight_kg");
      }
      const rawCat = getPropVal(genInfo, "BatteryCategory");
      if (rawCat) {
        mapped.submodels.public_nameplate.battery_category =
          CATEGORY_LABELS[rawCat.toLowerCase()] || rawCat;
        mark("nameplate.battery_category");
      }

      const techAreas = findEl(smTech.submodelElements, "TechnicalPropertyAreas")?.value || [];
      const capVolt = findEl(techAreas, "CapacityEnergyVoltage")?.value || [];
      const efficiency = findEl(techAreas, "RoundTripEnergyEfficiency")?.value || [];
      const resistance = findEl(techAreas, "Resistance")?.value || [];
      const lifetime = findEl(techAreas, "Lifetime")?.value || [];
      const temp = findEl(techAreas, "Temperature")?.value || [];

      const nomV = getPropVal(capVolt, "NominalVoltage");
      if (nomV !== undefined) {
        mapped.submodels.public_nameplate.nominal_voltage_v = nomV;
        mark("nameplate.nominal_voltage_v");
      }
      const minV = getPropVal(capVolt, "MinVoltage");
      if (minV !== undefined) {
        mapped.submodels.performance_durability.volt_min = minV;
        mark("performance.volt_min");
      }
      const maxV = getPropVal(capVolt, "MaxVoltage");
      if (maxV !== undefined) {
        mapped.submodels.performance_durability.volt_max = maxV;
        mark("performance.volt_max");
      }
      const ratedAh = getPropVal(capVolt, "RatedCapacity");
      if (ratedAh !== undefined) {
        mapped.submodels.public_nameplate.rated_capacity_ah = ratedAh;
        mark("nameplate.rated_capacity_ah");
      }
      const usableWh = getPropVal(capVolt, "CertifiedUsableBatteryEnergy");
      if (usableWh !== undefined) {
        mapped.submodels.public_nameplate.nominal_capacity_wh = usableWh;
        mark("nameplate.nominal_capacity_wh");
      }

      const initRes = getPropVal(resistance, "InitialInternalResistanceOnBatteryPackLevel");
      if (initRes !== undefined) {
        mapped.submodels.performance_durability.internal_resistance_initial_mohm = initRes;
        mark("performance.internal_resistance_initial_mohm");

        const resInc = getPropVal(resistance, "InternalResistanceIncreaseOfBatteryPackLevel");
        if (resInc !== undefined) {
          mapped.submodels.performance_durability.internal_resistance_current_mohm = Number(
            (initRes * (1 + resInc / 100)).toFixed(1)
          );
          mark("performance.internal_resistance_current_mohm");
        }
      }

      const effInit = getPropVal(efficiency, "InitialRoundTripEnergyEfficiency");
      if (effInit !== undefined) {
        mapped.submodels.performance_durability.round_trip_efficiency_initial_pct = effInit;
        mark("performance.round_trip_efficiency_initial_pct");
      }
      const eff50 = getPropVal(efficiency, "RoundTripEnergyEfficiencyAt50PercentOfCycleLife");
      if (eff50 !== undefined) {
        mapped.submodels.performance_durability.round_trip_efficiency_50pct_life_pct = eff50;
        mark("performance.round_trip_efficiency_50pct_life_pct");
      }

      const tMin = getPropVal(temp, "TemperatureRangeIdleState_LowerBoundary");
      if (tMin !== undefined) {
        mapped.submodels.performance_durability.temp_min = tMin;
        mark("performance.temp_min");
      }
      const tMax = getPropVal(temp, "TemperatureRangeIdleState_UpperBoundary");
      if (tMax !== undefined) {
        mapped.submodels.performance_durability.temp_max = tMax;
        mark("performance.temp_max");
      }

      const cycles = getPropVal(lifetime, "ExpectedNumberOfCycles");
      if (cycles !== undefined) {
        mapped.submodels.performance_durability.expected_lifetime_cycles = cycles;
        mark("performance.expected_lifetime_cycles");
      }
      const years = getPropVal(lifetime, "ExpectedLifetimeInCalendarYears");
      if (years !== undefined) {
        mapped.submodels.performance_durability.expected_lifetime_years = years;
        mark("performance.expected_lifetime_years");
      }
      const exhaustion = getPropVal(lifetime, "CapacityThresholdExhaustion");
      if (exhaustion !== undefined) {
        mapped.submodels.performance_durability.capacity_exhaustion_threshold_pct = exhaustion;
        mark("performance.capacity_exhaustion_threshold_pct");
      }
    }

    // 3. PRODUCT CONDITION (BMS)
    if (smCond?.submodelElements) {
      const els = smCond.submodelElements;
      const sohCol = findEl(els, "StateOfCertifiedEnergy")?.value || [];
      const cyclesCol = findEl(els, "NumberOfFullCycles")?.value || [];
      const remEnergyCol = findEl(els, "RemainingEnergy")?.value || [];
      const energyThruCol = findEl(els, "EnergyThroughput")?.value || [];
      const capThruCol = findEl(els, "CapacityThroughput")?.value || [];
      const remEffCol = findEl(els, "RemainingRoundTripEnergyEfficiency")?.value || [];
      const remPowCol = findEl(els, "RemainingPowerCapability")?.value || [];
      const remPowDynCol = findEl(remPowCol, "RemainingPowerCapabilityDynamicAt")?.value || [];

      const soh = getPropVal(sohCol, "StateOfCertifiedEnergyValue");
      if (soh !== undefined) {
        mapped.submodels.dynamic_bms.state_of_health_soh = soh;
        mark("bms.state_of_health_soh");
      }
      const fullCycles = getPropVal(cyclesCol, "NumberOfFullCyclesValue");
      if (fullCycles !== undefined) {
        mapped.submodels.dynamic_bms.charge_cycles = fullCycles;
        mark("bms.charge_cycles");
      }
      const remWh = getPropVal(remEnergyCol, "RemainingEnergyValue");
      if (remWh !== undefined) {
        mapped.submodels.dynamic_bms.remaining_capacity_wh = remWh;
        mark("bms.remaining_capacity_wh");
      }
      const remPow = getPropVal(remPowDynCol, "PowerCapabilityAt");
      if (remPow !== undefined) {
        mapped.submodels.dynamic_bms.remaining_power_w = remPow;
        mark("bms.remaining_power_w");
      }
      const remEff = getPropVal(remEffCol, "RemainingRoundTripEnergyEfficiencyValue");
      if (remEff !== undefined) {
        mapped.submodels.dynamic_bms.remaining_efficiency_pct = remEff;
        mark("bms.remaining_efficiency_pct");
      }
      const eThru = getPropVal(energyThruCol, "EnergyThroughputValue");
      if (eThru !== undefined) {
        mapped.submodels.dynamic_bms.energy_throughput_wh = eThru;
        mark("bms.energy_throughput_wh");
      }
      const cThru = getPropVal(capThruCol, "CapacityThroughputValue");
      if (cThru !== undefined) {
        mapped.submodels.dynamic_bms.capacity_throughput_ah = cThru;
        mark("bms.capacity_throughput_ah");
      }
      const lastSync = getPropVal(sohCol, "LastUpdate");
      if (lastSync) {
        mapped.submodels.dynamic_bms.last_sync = `Sincronizado desde Azure BaSyx (${lastSync.replace("T", " ")})`;
        mark("bms.last_sync");
      }

      const negEventsList = findEl(els, "NegativeEvents")?.value || [];
      if (negEventsList.length > 0) {
        const evEls = negEventsList[0].value || [];
        const evVal = getPropVal(evEls, "NegativeEventValue");
        const evDate = getPropVal(evEls, "LastUpdate");
        if (evVal !== undefined) {
          mapped.submodels.dynamic_bms.extreme_events = [
            {
              event:
                evVal.toLowerCase() === "none"
                  ? "Sin eventos críticos registrados (Normal)"
                  : `Evento registrado: ${evVal}`,
              date: evDate ? evDate.split("T")[0] : "2026-11-13",
              impact:
                evVal.toLowerCase() === "none"
                  ? "0% degradación anómala"
                  : "Requiere inspección en taller",
            },
          ];
          mark("bms.extreme_events");
        }
      }
    }

    // 4. CARBON FOOTPRINT + DESGLOSE DINÁMICO MULTILINGÜE
    if (smCarbon?.submodelElements) {
      const pcfList = findEl(smCarbon.submodelElements, "ProductCarbonFootprints")?.value || [];
      const pcfItem = pcfList[0]?.value || [];

      const co2 = getPropVal(pcfItem, "PcfCO2eq");
      if (co2 !== undefined) {
        mapped.submodels.carbon_circularity.carbon_footprint_kg_kwh = co2;
        mark("carbon.carbon_footprint_kg_kwh");
      }
      const perfClass = getPropVal(pcfItem, "PerformanceClass");
      if (perfClass) {
        mapped.submodels.carbon_circularity.performance_class = perfClass;
        mark("carbon.performance_class");
      }

      // Buscar LifecycleBreakdown tanto dentro de ProductCarbonFootprints como en pcfItem o raíz
      const breakdownCol =
        findEl(pcfList, "LifecycleBreakdown")?.value ||
        findEl(pcfItem, "LifecycleBreakdown")?.value ||
        findEl(smCarbon.submodelElements, "LifecycleBreakdown")?.value ||
        [];

      if (breakdownCol.length > 0) {
        const parsedStages = breakdownCol
          .map((stageCol) => {
            const sEls = stageCol.value || [];
            const stage = getTextVal(findEl(sEls, "stageName"), lang);
            const share = getPropVal(sEls, "PCFValue");
            if (!stage || share === undefined) return null;
            return { stage, share };
          })
          .filter(Boolean);

        if (parsedStages.length > 0) {
          mapped.submodels.carbon_circularity.lifecycle_breakdown = parsedStages;
          mark("carbon.lifecycle_breakdown");
        }
      }
    }

    // 5. MATERIAL COMPOSITION
    if (smMat?.submodelElements) {
      const els = smMat.submodelElements;
      const chemCol = findEl(els, "BatteryChemistry")?.value || [];
      const shortChem = getPropVal(chemCol, "ShortName");
      const clearChem = getPropVal(chemCol, "ClearName");
      if (shortChem) {
        mapped.submodels.public_nameplate.chemistry = shortChem;
        mark("nameplate.chemistry");
      }

      const neutralization = getTextVal(findEl(els, "SafetyNeutralization"), lang);
      if (neutralization) {
        mapped.submodels.recycler_chemistry.safety_neutralization = neutralization;
        mark("chemistry.safety_neutralization");
      }

      const materialsList = findEl(els, "BatteryMaterials")?.value || [];
      if (materialsList.length > 0) {
        const byLocation = { cathode: [], anode: [], electrolyte: [] };
        for (const m of materialsList) {
          const mEls = m.value || [];
          const name = getPropVal(mEls, "BatteryMaterialName");
          const mass = getPropVal(mEls, "BatteryMaterialMass");
          const locCol = findEl(mEls, "BatteryMaterialLocation")?.value || [];
          const loc = (getPropVal(locCol, "ComponentName", "Cathode") || "").toLowerCase();
          const label = name && mass !== undefined ? `${name}: ${mass} g` : name;
          if (!label) continue;
          if (loc.includes("anode")) byLocation.anode.push(label);
          else if (loc.includes("electrolyte")) byLocation.electrolyte.push(label);
          else byLocation.cathode.push(label);
        }

        if (byLocation.cathode.length > 0) {
          mapped.submodels.recycler_chemistry.cathode = `${clearChem || shortChem || "NMC 811"} (${byLocation.cathode.join(" · ")})`;
          mark("chemistry.cathode");
        }
        if (byLocation.anode.length > 0) {
          mapped.submodels.recycler_chemistry.anode = byLocation.anode.join(" · ");
          mark("chemistry.anode");
        }
        if (byLocation.electrolyte.length > 0) {
          mapped.submodels.recycler_chemistry.electrolyte = byLocation.electrolyte.join(" · ");
          mark("chemistry.electrolyte");
        }
      }

      const hazList = findEl(els, "HazardousSubstances")?.value || [];
      if (hazList.length > 0) {
        mapped.submodels.recycler_chemistry.hazardous_substances = hazList.map((h) => {
          const hEls = h.value || [];
          const name = getPropVal(hEls, "HazardousSubstanceName", "Sustancia");
          const cas = getPropVal(hEls, "HazardousSubstanceIdentifier", "-");
          const conc = getPropVal(hEls, "HazardousSubstanceConcentration");
          const locCol = findEl(hEls, "HazardousSubstanceLocation")?.value || [];
          const loc = getPropVal(locCol, "ComponentName", "Cathode");
          return conc !== undefined
            ? `${name} [CAS ${cas}] · ${conc}% en ${loc}`
            : `${name} [CAS ${cas}]`;
        });
        mark("chemistry.hazardous_substances");
      }

      mapped.submodels.recycler_chemistry.source_node = `Azure BaSyx AAS v3.0 (${smMat.idShort})`;
      mark("chemistry.source_node");
    }

    // 6. CIRCULARITY
    if (smCirc?.submodelElements) {
      const els = smCirc.submodelElements;

      const renewable = getPropVal(els, "RenewableContent");
      if (renewable !== undefined) {
        mapped.submodels.carbon_circularity.renewable_content = renewable;
        mark("carbon.renewable_content");
      }

      const cellArch = getTextVal(findEl(els, "CellArchitecture"), lang);
      if (cellArch) {
        mapped.submodels.workshop_repair.cell_architecture = cellArch;
        mark("repair.cell_architecture");
      }

      const safetyCol = findEl(els, "SafetyMeasures")?.value || [];
      const extList = findEl(safetyCol, "ExtinguishingAgents")?.value || [];
      const agents = extList.map((item) => item.value).filter(Boolean);
      if (agents.length > 0) {
        mapped.submodels.public_nameplate.extinguishing_agents = agents;
        mark("nameplate.extinguishing_agents");
      }

      const dismantlingList = findEl(els, "DismantlingAndRemovalInformation")?.value || [];
      if (dismantlingList[0]?.value) {
        mapped.submodels.workshop_repair.disassembly_manual = dismantlingList[0].value;
        mark("repair.disassembly_manual");
      }

      const eolCol = findEl(els, "EndOfLifeInformation")?.value || [];
      const wastePrev = findEl(eolCol, "WastePrevention")?.value?.[0]?.value;
      const sepColl = findEl(eolCol, "SeparateCollection")?.value?.[0]?.value;
      const infoColl = findEl(eolCol, "InformationOnCollection")?.value?.[0]?.value;
      if (wastePrev || sepColl || infoColl) {
        const parts = [
          wastePrev ? `Prevención/2ª Vida: ${wastePrev}` : null,
          sepColl ? `Recogida separada: ${sepColl}` : null,
          infoColl ? `Puntos autorizados: ${infoColl}` : null,
        ].filter(Boolean);
        mapped.submodels.carbon_circularity.end_of_life_info = parts.join(" · ");
        mark("carbon.end_of_life_info");
      }

      const sparesList = findEl(els, "SparePartSources")?.value || [];
      const extractedParts = [];
      for (const supplier of sparesList) {
        const sEls = supplier.value || [];
        const webAddr = getPropVal(sEls, "SupplierWebAddress");
        if (webAddr) {
          mapped.submodels.workshop_repair.supplier_web = webAddr;
          mark("repair.supplier_web");
        }
        const emailCol = findEl(sEls, "EmailAddressOfSupplier")?.value || [];
        const emailAddr = getPropVal(emailCol, "EmailAddress");
        if (emailAddr) {
          mapped.submodels.workshop_repair.supplier_email = emailAddr;
          mark("repair.supplier_email");
        }

        const comps = findEl(sEls, "Components")?.value || [];
        for (const comp of comps) {
          const cEls = comp.value || [];
          const partName = getPropVal(cEls, "PartName");
          const partNum = getPropVal(cEls, "PartNumber");
          if (partName) {
            extractedParts.push(partNum ? `${partName} (${partNum})` : partName);
          }
        }
      }
      if (extractedParts.length > 0) {
        mapped.submodels.workshop_repair.spare_parts = extractedParts;
        mark("repair.spare_parts");
      }

      const recList = findEl(els, "RecycledContentInformation")?.value || [];
      const parsedRecycled = recList
        .map((item) => {
          const rEls = item.value || [];
          const rawMat = (getPropVal(rEls, "RecycledMaterial", "") || "").trim();
          const key = rawMat.toLowerCase();
          const pre = getPropVal(rEls, "PreConsumerShare", 0);
          const post = getPropVal(rEls, "PostConsumerShare", 0);
          if (!rawMat) return null;
          return {
            material: MATERIAL_LABELS_ES[key] || rawMat,
            actual: Number((pre + post).toFixed(1)),
            target_2031: TARGET_2031_SHARES[key] || 10,
          };
        })
        .filter(Boolean);

      if (parsedRecycled.length > 0) {
        mapped.submodels.carbon_circularity.recycled_content = parsedRecycled;
        mark("carbon.recycled_content");
      }
    }

    // 7. HANDOVER DOCUMENTATION
    if (smDocs?.submodelElements) {
      const docsList = findEl(smDocs.submodelElements, "Documents")?.value || [];
      const parsedDocs = [];

      docsList.forEach((doc, idx) => {
        const dEls = doc.value || [];
        const idCol = findEl(dEls, "DocumentIds")?.value?.[0]?.value || [];
        const classCol = findEl(dEls, "DocumentClassifications")?.value?.[0]?.value || [];
        const verCol = findEl(dEls, "DocumentVersions")?.value?.[0]?.value || [];
        const fileEl = findEl(verCol, "DigitalFiles")?.value?.[0];

        const classId = getPropVal(classCol, "ClassId", idx === 0 ? "03-01" : "04-01");
        const docId = getPropVal(idCol, "DocumentIdentifier", `DOC-${idx + 1}`);
        const title = getTextVal(findEl(verCol, "Title"), lang, "Documento técnico");
        const version = getPropVal(verCol, "Version", "1.0");
        const statusDate = getPropVal(verCol, "StatusSetDate", "");
        const orgName =
          getPropVal(verCol, "OrganizationOfficialName") ||
          getPropVal(verCol, "OrganizationShortName");
        const docDesc = getTextVal(findEl(verCol, "Description"), lang, "");

        parsedDocs.push({
          doc_id: docId,
          class_id: classId,
          title,
          version,
          file_url: fileEl?.value || "#",
        });
        mark(`docs.${idx}.doc_id`);
        mark(`docs.${idx}.title`);
        mark(`docs.${idx}.version`);

        if (classId === "03-01" || idx === 0) {
          if (docId && docId !== "123-ABC-789") {
            mapped.submodels.regulatory_compliance.eu_declaration_id = docId;
            mark("compliance.eu_declaration_id");
          }
          if (statusDate) {
            mapped.submodels.regulatory_compliance.audit_date = statusDate;
            mark("compliance.audit_date");
          }
          if (orgName && !orgName.includes("AAS Example")) {
            mapped.submodels.regulatory_compliance.notified_body = orgName;
            mark("compliance.notified_body");
          }
          if (docDesc) {
            const cleanList = docDesc.includes(":") ? docDesc.split(":")[1] : docDesc;
            const standards = cleanList
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            if (standards.length > 0) {
              mapped.submodels.regulatory_compliance.standards_applied = standards;
              mark("compliance.standards_applied");
            }
          }
        }

        if ((classId === "04-01" || idx === 1) && docId && docId !== "123-ABC-789") {
          mapped.submodels.workshop_repair.disassembly_manual = docId;
          mark("repair.disassembly_manual");
        }
      });

      if (parsedDocs.length > 0) {
        mapped.submodels.handover_documentation = parsedDocs;
      }
    }

    // 8. SUPPLY CHAIN DUE DILIGENCE (Art. 48)
    if (smDue?.submodelElements) {
      const els = smDue.submodelElements;
      const certId = getPropVal(els, "CertificateId");
      if (certId) {
        mapped.submodels.supply_chain_due_diligence.public_attestation.certificate_id = certId;
        mark("dd.certificate_id");
      }
      const status = getTextVal(findEl(els, "Status"), lang);
      if (status) {
        mapped.submodels.supply_chain_due_diligence.public_attestation.status = status;
        mark("dd.status");
      }
      const auditor = getPropVal(els, "Auditor");
      if (auditor) {
        mapped.submodels.supply_chain_due_diligence.public_attestation.auditor = auditor;
        mark("dd.auditor");
      }
      const auditDate = getPropVal(els, "AuditDate");
      if (auditDate) {
        mapped.submodels.supply_chain_due_diligence.public_attestation.audit_date = auditDate;
        mark("dd.audit_date");
      }
      const summary = getTextVal(findEl(els, "Summary"), lang);
      if (summary) {
        mapped.submodels.supply_chain_due_diligence.public_attestation.summary = summary;
        mark("dd.summary");
      }
      const mineralsStr = getTextVal(findEl(els, "CoveredMinerals"), lang);
      if (mineralsStr) {
        mapped.submodels.supply_chain_due_diligence.public_attestation.covered_minerals =
          mineralsStr
            .split(",")
            .map((m) => m.trim())
            .filter(Boolean);
        mark("dd.covered_minerals");
      }

      const tierList = findEl(els, "RestrictedTierTraceability")?.value || [];
      if (tierList.length > 0) {
        mapped.submodels.supply_chain_due_diligence.restricted_tier_traceability = tierList.map(
          (batchCol) => {
            const bEls = batchCol.value || [];
            return {
              mineral: getPropVal(bEls, "Mineral", "Material"),
              origin: getPropVal(bEls, "Origin", "-"),
              refiner: getPropVal(bEls, "Refiner", "-"),
              batch_vc: getPropVal(bEls, "BatchVC", "-"),
            };
          }
        );
        mark("dd.restricted_tier_traceability");
      }
    }

    return { data: mapped, source: "basyx", mappedFields: Array.from(mappedFields) };
  } catch (err) {
    console.warn("No se pudo conectar con Azure BaSyx, usando datos locales:", err.message);
    return { data: fallbackData, source: "local", mappedFields: [] };
  }
}
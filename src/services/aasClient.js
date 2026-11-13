import fallbackData from "../data/batteryDpp.json";

const RAW_AAS_URL = import.meta.env.VITE_AAS_BASE_URL || "http://158.158.54.56:8081";
const AAS_BASE_URL =
  typeof window !== "undefined" &&
  window.location.protocol === "https:" &&
  RAW_AAS_URL.startsWith("http://")
    ? "/api/aas"
    : RAW_AAS_URL;

// Extrae texto tanto de MultiLanguageProperty como de Property simple
function getTextVal(el, fallback = undefined) {
  if (!el || el.value === undefined || el.value === null) return fallback;
  if (typeof el.value === "string") return el.value !== "" ? el.value : fallback;
  if (Array.isArray(el.value) && el.value.length > 0) {
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

export async function fetchBatteryDpp() {
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

    const mapped = structuredClone(fallbackData);

    // 1. NAMEPLATE (IDTA 02006 / 02035-1)
    if (smNameplate?.submodelElements) {
      const els = smNameplate.submodelElements;
      const mfgName = getTextVal(findEl(els, "ManufacturerName"));
      if (mfgName) {
        mapped.submodels.public_nameplate.manufacturer = mfgName;
        mark("nameplate.manufacturer");
      }
      const prodName = getTextVal(findEl(els, "ManufacturerProductDesignation"));
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
    }

    // 2. TECHNICAL DATA (IDTA 02035-4)
    if (smTech?.submodelElements) {
      const genInfo = findEl(smTech.submodelElements, "GeneralInformation")?.value || [];
      const opName = getTextVal(findEl(genInfo, "ManufacturerName"));
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

      const nomV = getPropVal(capVolt, "NominalVoltage");
      if (nomV !== undefined) {
        mapped.submodels.public_nameplate.nominal_voltage_v = nomV;
        mark("nameplate.nominal_voltage_v");
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

    // 3. PRODUCT CONDITION - TELEMETRÍA BMS (IDTA 02035-5)
    if (smCond?.submodelElements) {
      const els = smCond.submodelElements;
      const sohCol = findEl(els, "StateOfCertifiedEnergy")?.value || [];
      const cyclesCol = findEl(els, "NumberOfFullCycles")?.value || [];
      const remEnergyCol = findEl(els, "RemainingEnergy")?.value || [];

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

    // 4. CARBON FOOTPRINT (IDTA 02023 / 02035-3)
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
    }

    // 5. MATERIAL COMPOSITION (IDTA 02035-6)
    if (smMat?.submodelElements) {
      const chemCol = findEl(smMat.submodelElements, "BatteryChemistry")?.value || [];
      const shortChem = getPropVal(chemCol, "ShortName");
      const clearChem = getPropVal(chemCol, "ClearName");
      if (shortChem) {
        mapped.submodels.public_nameplate.chemistry = shortChem;
        mark("nameplate.chemistry");
      }

      const materialsList = findEl(smMat.submodelElements, "BatteryMaterials")?.value || [];
      if (materialsList.length > 0) {
        const crmSummary = materialsList
          .map((m) => {
            const mEls = m.value || [];
            const name = getPropVal(mEls, "BatteryMaterialName");
            const mass = getPropVal(mEls, "BatteryMaterialMass");
            return name && mass !== undefined ? `${name}: ${mass} g` : name;
          })
          .filter(Boolean)
          .join(" · ");

        mapped.submodels.recycler_chemistry.cathode = `${clearChem || shortChem || "NMC 811"} (${crmSummary})`;
        mark("chemistry.cathode");
      }

      const hazList = findEl(smMat.submodelElements, "HazardousSubstances")?.value || [];
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

    // 6. CIRCULARITY (IDTA 02035-7)
    if (smCirc?.submodelElements) {
      const els = smCirc.submodelElements;
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

    // 7. HANDOVER DOCUMENTATION (IDTA 02004 / 02035-2)
    if (smDocs?.submodelElements) {
      const docsList = findEl(smDocs.submodelElements, "Documents")?.value || [];
      docsList.forEach((doc, idx) => {
        const dEls = doc.value || [];
        const idCol = findEl(dEls, "DocumentIds")?.value?.[0]?.value || [];
        const classCol = findEl(dEls, "DocumentClassifications")?.value?.[0]?.value || [];
        const verCol = findEl(dEls, "DocumentVersions")?.value?.[0]?.value || [];

        const classId = getPropVal(classCol, "ClassId", "");
        const docId = getPropVal(idCol, "DocumentIdentifier", "");
        const statusDate = getPropVal(verCol, "StatusSetDate", "");

        if ((classId === "03-01" || idx === 0) && docId && docId !== "123-ABC-789") {
          mapped.submodels.regulatory_compliance.eu_declaration_id = docId;
          mark("compliance.eu_declaration_id");
          if (statusDate) {
            mapped.submodels.regulatory_compliance.audit_date = statusDate;
            mark("compliance.audit_date");
          }
        }
        if ((classId === "04-01" || idx === 1) && docId && docId !== "123-ABC-789") {
          mapped.submodels.workshop_repair.disassembly_manual = docId;
          mark("repair.disassembly_manual");
        }
      });
    }

    return { data: mapped, source: "basyx", mappedFields: Array.from(mappedFields) };
  } catch (err) {
    console.warn("No se pudo conectar con Azure BaSyx, usando datos locales:", err.message);
    return { data: fallbackData, source: "local", mappedFields: [] };
  }
}
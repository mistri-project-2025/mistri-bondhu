// src/pages/workers/WorkerProfile.jsx
import { useEffect, useState } from "react";
import { CATEGORIES } from "../../utils/categories";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";

const ALL_STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"];
                                            const STATE_DISTRICTS = {
"Andhra Pradesh": ["Alluri Sitharama Raju","Anakapalli","Anantapur","Annamayya","Bapatla","Chittoor","Dr B R Ambedkar Konaseema","East Godavari","Eluru","Guntur","Kakinada","Krishna","Kurnool","Nandyal","NTR","Palnadu","Parvathipuram Manyam","Prakasam","Sri Potti Sriramulu Nellore","Sri Sathya Sai","Srikakulam","Tirupati","Visakhapatnam","Vizianagaram","West Godavari","YSR Kadapa"],
"Arunachal Pradesh": ["Anjaw","Changlang","Dibang Valley","East Kameng","East Siang","Kamle","Kra Daadi","Kurung Kumey","Lepa Rada","Lohit","Longding","Lower Dibang Valley","Lower Siang","Lower Subansiri","Namsai","Pakke Kessang","Papum Pare","Shi Yomi","Siang","Tawang","Tirap","Upper Siang","Upper Subansiri","West Kameng","West Siang"],
"Assam": ["Bajali","Baksa","Barpeta","Biswanath","Bongaigaon","Cachar","Charaideo","Chirang","Darrang","Dhemaji","Dhubri","Dibrugarh","Dima Hasao","Goalpara","Golaghat","Hailakandi","Hojai","Jorhat","Kamrup","Kamrup Metropolitan","Karbi Anglong","Karimganj","Kokrajhar","Lakhimpur","Majuli","Morigaon","Nagaon","Nalbari","Nalbari","Sivasagar","Sonitpur","South Salmara-Mankachar","Tamulpur","Tinsukia","Udalguri","West Karbi Anglong"],
"Bihar": ["Araria","Arwal","Aurangabad","Banka","Begusarai","Bhagalpur","Bhojpur","Buxar","Darbhanga","East Champaran","Gaya","Gopalganj","Jamui","Jehanabad","Kaimur","Katihar","Khagaria","Kishanganj","Lakhisarai","Madhepura","Madhubani","Munger","Muzaffarpur","Nalanda","Nawada","Patna","Purnia","Rohtas","Saharsa","Samastipur","Saran","Sheikhpura","Sheohar","Sitamarhi","Siwan","Supaul","Vaishali","West Champaran"],
"Chhattisgarh": ["Balod","Baloda Bazar","Balrampur","Bastar","Bemetara","Bijapur","Bilaspur","Dantewada","Dhamtari","Durg","Gariaband","Gaurela-Pendra-Marwahi","Janjgir-Champa","Jashpur","Kabirdham","Kanker","Khairagarh-Chhuikhadan-Gandai","Kondagaon","Korba","Koriya","Mahasamund","Manendragarh-Chirmiri-Bharatpur","Mohla-Manpur-Ambagarh Chowki","Mungeli","Narayanpur","Raigarh","Raipur","Rajnandgaon","Sakti","Sarangarh-Bilaigarh","Sukma","Surajpur","Surguja"],
"Delhi": ["Central Delhi","East Delhi","New Delhi","North Delhi","North East Delhi","North West Delhi","Shahdara","South Delhi","South East Delhi","South West Delhi","West Delhi"],
"Goa": ["North Goa","South Goa"],
"Gujarat": ["Ahmedabad","Amreli","Anand","Aravalli","Banaskantha","Bharuch","Bhavnagar","Botad","Chhota Udaipur","Dahod","Dang","Devbhoomi Dwarka","Gandhinagar","Gir Somnath","Jamnagar","Junagadh","Kheda","Kutch","Mahisagar","Mehsana","Morbi","Narmada","Navsari","Panchmahal","Patan","Porbandar","Rajkot","Sabarkantha","Surat","Surendranagar","Tapi","Vadodara","Valsad"],
"Haryana": ["Ambala","Bhiwani","Charkhi Dadri","Faridabad","Fatehabad","Gurugram","Hisar","Jhajjar","Jind","Kaithal","Karnal","Kurukshetra","Mahendragarh","Nuh","Palwal","Panchkula","Panipat","Rewari","Rohtak","Sirsa","Sonipat","Yamunanagar"],
"Himachal Pradesh": ["Bilaspur","Chamba","Hamirpur","Kangra","Kinnaur","Kullu","Lahaul and Spiti","Mandi","Shimla","Sirmaur","Solan","Una"],                                    "Jharkhand": ["Bokaro","Chatra","Deoghar","Dhanbad","Dumka","East Singhbhum","Garhwa","Giridih","Godda","Gumla","Hazaribagh","Jamtara","Khunti","Koderma","Latehar","Lohardaga","Pakur","Palamu","Ramgarh","Ranchi","Sahibganj","Seraikela-Kharsawan","Simdega","West Singhbhum"],                                  "Karnataka": ["Bagalkot","Ballari","Belagavi","Bengaluru Rural","Bengaluru Urban","Bidar","Chamarajanagar","Chikkaballapur","Chikkamagaluru","Chitradurga","Dakshina Kannada","Davanagere","Dharwad","Gadag","Hassan","Haveri","Kalaburagi","Kodagu","Kolar","Koppal","Mandya","Mysuru","Raichur","Ramanagara","Shivamogga","Tumakuru","Udupi","Uttara Kannada","Vijayapura","Yadgir","Vijayanagara"],
"Kerala": ["Alappuzha","Ernakulam","Idukki","Kannur","Kasaragod","Kollam","Kottayam","Kozhikode","Malappuram","Palakkad","Pathanamthitta","Thiruvananthapuram","Thrissur","Wayanad"],
"Madhya Pradesh": ["Agar Malwa","Alirajpur","Anuppur","Ashoknagar","Balaghat","Barwani","Betul","Bhind","Bhopal","Burhanpur","Chhatarpur","Chhindwara","Damoh","Datia","Dewas","Dhar","Dindori","Guna","Gwalior","Harda","Hoshangabad","Indore","Jabalpur","Jhabua","Katni","Khandwa","Khargone","Mandla","Mandsaur","Morena","Narsinghpur","Neemuch","Niwari","Panna","Raisen","Rajgarh","Ratlam","Rewa","Sagar","Satna","Sehore","Seoni","Shahdol","Shajapur","Sheopur","Shivpuri","Sidhi","Singrauli","Tikamgarh","Ujjain","Umaria","Vidisha"],
"Maharashtra": ["Ahmednagar","Akola","Amravati","Aurangabad","Beed","Bhandara","Buldhana","Chandrapur","Dhule","Gadchiroli","Gondia","Hingoli","Jalgaon","Jalna","Kolhapur","Latur","Mumbai City","Mumbai Suburban","Nagpur","Nanded","Nandurbar","Nashik","Osmanabad","Palghar","Parbhani","Pune","Raigad","Ratnagiri","Sangli","Satara","Sindhudurg","Solapur","Thane","Wardha","Washim","Yavatmal"],
"Manipur": ["Bishnupur","Chandel","Churachandpur","Imphal East","Imphal West","Jiribam","Kakching","Kamjong","Kangpokpi","Noney","Pherzawl","Senapati","Tamenglong","Tengnoupal","Thoubal","Ukhrul"],                       "Meghalaya": ["East Garo Hills","East Jaintia Hills","East Khasi Hills","Eastern West Khasi Hills","North Garo Hills","Ri Bhoi","South Garo Hills","South West Garo Hills","South West Khasi Hills","West Garo Hills","West Jaintia Hills","West Khasi Hills"],
"Mizoram": ["Aizawl","Champhai","Hnahthial","Khawzawl","Kolasib","Lawngtlai","Lunglei","Mamit","Saiha","Saitual","Serchhip"],
"Nagaland": ["Chumoukedima","Dimapur","Kiphire","Kohima","Longleng","Mokokchung","Mon","Niuland","Noklak","Peren","Phek","Shamator","Tseminyu","Tuensang","Wokha","Zunheboto"],
"Odisha": ["Angul","Balangir","Balasore","Bargarh","Bhadrak","Boudh","Cuttack","Deogarh","Dhenkanal","Gajapati","Ganjam","Jagatsinghpur","Jajpur","Jharsuguda","Kalahandi","Kandhamal","Kendrapara","Kendujhar","Khordha","Koraput","Malkangiri","Mayurbhanj","Nabarangpur","Nayagarh","Nuapada","Puri","Rayagada","Sambalpur","Subarnapur","Sundargarh"],      "Punjab": ["Amritsar","Barnala","Bathinda","Faridkot","Fatehgarh Sahib","Fazilka","Ferozepur","Gurdaspur","Hoshiarpur","Jalandhar","Kapurthala","Ludhiana","Malerkotla","Mansa","Moga","Pathankot","Patiala","Rupnagar","Sangrur","SAS Nagar","SBS Nagar","Sri Muktsar Sahib","Tarn Taran"],
"Rajasthan": ["Ajmer","Alwar","Balotra","Banswara","Baran","Barmer","Beawar","Bharatpur","Bhilwara","Bikaner","Bundi","Chittorgarh","Churu","Dausa","Deeg","Dholpur","Didwana-Kuchaman","Dudu","Dungarpur","Gangapur City","Hanumangarh","Jaipur","Jaipur Rural","Jaisalmer","Jalore","Jhalawar","Jhunjhunu","Jodhpur","Jodhpur Rural","Karauli","Kekri","Khairthal-Tijara","Kota","Kotputli-Behror","Nagaur","Neem Ka Thana","Pali","Phalodi","Pratapgarh","Rajsamand","Salumbar","Sanchore","Sawai Madhopur","Sikar","Sirohi","Sri Ganganagar","Tonk","Udaipur"],                         "Sikkim": ["Gangtok","Gyalshing","Mangan","Namchi","Pakyong","Soreng"],                 "Tamil Nadu": ["Ariyalur","Chengalpattu","Chennai","Coimbatore","Cuddalore","Dharmapuri","Dindigul","Erode","Kallakurichi","Kanchipuram","Kanyakumari","Karur","Krishnagiri","Madurai","Mayiladuthurai","Nagapattinam","Namakkal","Nilgiris","Perambalur","Pudukkottai","Ramanathapuram","Ranipet","Salem","Sivaganga","Tenkasi","Thanjavur","Theni","Thoothukudi","Tiruchirappalli","Tirunelveli","Tirupathur","Tiruppur","Tiruvallur","Tiruvannamalai","Tiruvarur","Vellore","Viluppuram","Virudhunagar"],
"Telangana": ["Adilabad","Bhadradri Kothagudem","Hanumakonda","Hyderabad","Jagtial","Jangaon","Jayashankar Bhupalpally","Jogulamba Gadwal","Kamareddy","Karimnagar","Khammam","Komaram Bheem Asifabad","Mahabubabad","Mahabubnagar","Mancherial","Medak","Medchal-Malkajgiri","Mulugu","Nagarkurnool","Nalgonda","Narayanpet","Nirmal","Nizamabad","Peddapalli","Rajanna Sircilla","Rangareddy","Sangareddy","Siddipet","Suryapet","Vikarabad","Wanaparthy","Warangal","Yadri Bhuvanagiri"],
"Tripura": ["Dhalai","Gomati","Khowai","North Tripura","Sepahijala","South Tripura","Unakoti","West Tripura"],
"Uttar Pradesh": ["Agra","Aligarh","Ambedkar Nagar","Amethi","Amroha","Auraiya","Ayodhya","Azamgarh","Baghpat","Bahraich","Ballia","Balrampur","Banda","Barabanki","Bareilly","Basti","Bhadohi","Bijnor","Budaun","Bulandshahr","Chandauli","Chitrakoot","Deoria","Etah","Etawah","Farrukhabad","Fatehpur","Firozabad","Gautam Buddha Nagar","Ghaziabad","Ghazipur","Gonda","Gorakhpur","Hamirpur","Hapur","Hardoi","Hathras","Jalaun","Jaunpur","Jhansi","Kannauj","Kanpur Dehat","Kanpur Nagar","Kasganj","Kaushambi","Kheri","Kushinagar","Lalitpur","Lucknow","Maharajganj","Mahoba","Mainpuri","Mathura","Mau","Meerut","Mirzapur","Moradabad","Muzaffarnagar","Pilibhit","Pratapgarh","Prayagraj","Rae Bareli","Rampur","Saharanpur","Sambhal","Sant Kabir Nagar","Shahjahanpur","Shamli","Shrawasti","Siddharthnagar","Sitapur","Sonbhadra","Sultanpur","Unnao","Varanasi"],
"Uttarakhand": ["Almora","Bageshwar","Chamoli","Champawat","Dehradun","Haridwar","Nainital","Pauri Garhwal","Pithoragarh","Rudraprayag","Tehri Garhwal","Udham Singh Nagar","Uttarkashi"],
"West Bengal": ["Alipurduar","Bankura","Birbhum","Cooch Behar","Dakshin Dinajpur","Darjeeling","Hooghly","Howrah","Jalpaiguri","Jhargram","Kalimpong","Kolkata","Malda","Murshidabad","Nadia","North 24 Parganas","Paschim Bardhaman","Paschim Medinipur","Purba Bardhaman","Purba Medinipur","Purulia","South 24 Parganas","Uttar Dinajpur"],
"Andaman and Nicobar Islands": ["Nicobar","North and Middle Andaman","South Andaman"],
"Chandigarh": ["Chandigarh"],
"Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli","Daman","Diu"],   "Jammu and Kashmir": ["Anantnag","Bandipora","Baramulla","Budgam","Doda","Ganderbal","Jammu","Kathua","Kishtwar","Kulgam","Kupwara","Poonch","Pulwama","Rajouri","Ramban","Reasi","Samba","Shopian","Srinagar","Udhampur"], "Ladakh": ["Kargil","Leh"],
"Lakshadweep": ["Lakshadweep"],
"Puducherry": ["Karaikal","Mahe","Puducherry","Yanam"]
};

export default function WorkerProfile({ uid, onClose }) {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ phone:"", name:"", businessName:"", experience:"", categoryIds:[], categories:[], state:"", district:"", pincode:"", ps:"", po:"", village:"" });
  const [catSearch, setCatSearch] = useState("");
  const [showCat, setShowCat] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ if(form.state) setDistricts(STATE_DISTRICTS[form.state]||[]); },[form.state]);

  // ✅ তোমার আগের LOAD LOGIC - same
  useEffect(() => {
    if (!uid) return;
    const loadProfile = async () => {
      try {
        let ref = doc(db, "workers", uid);
        let snap = await getDoc(ref);
        if (!snap.exists()) {
          ref = doc(db, "pendingWorkers", uid);
          snap = await getDoc(ref);
        }
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            phone: data.phone || "",
            name: data.name || "",
            businessName: data.businessName || "",
            experience: data.experience || "",
            categoryIds: data.categoryIds || [],
            categories: data.categories || [],
            state: data.state || "",
            district: data.district || data.dist || "",
            pincode: data.pincode || "",
            ps: data.ps || "",
            po: data.po || "",
            village: data.village || "",
          });
          setCatSearch((data.categories||[]).join(", "));
          if (user) login({...user,...data });
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadProfile();
  }, [uid]);

  const toggleCategory = (cat) => {
    const exists = form.categoryIds.includes(cat.id);
    if(exists) setForm({...form, categoryIds: form.categoryIds.filter(id=>id!==cat.id), categories: form.categories.filter(c=>c!==cat.en)});
    else setForm({...form, categoryIds:[...form.categoryIds, cat.id], categories:[...form.categories, cat.en]});
  };

  // ✅ তোমার আগের SAVE LOGIC - 100% working
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let ref = doc(db, "workers", uid);
      let snap = await getDoc(ref);
      if (!snap.exists()) {
        ref = doc(db, "pendingWorkers", uid);
      }
      const fullAddress = `${form.state}, Vill: ${form.village}, PO: ${form.po}, PS: ${form.ps}, PIN: ${form.pincode}, DIST: ${form.district}`;
      await setDoc(ref, {
        name: form.name,
        businessName: form.businessName,
        categoryIds: form.categoryIds,
        category: form.categories.join(", "),
        categories: form.categories,
        state: form.state,
        district: form.district,
        dist: form.district,
        pincode: form.pincode,
        ps: form.ps,
        po: form.po,
        village: form.village,
        address: fullAddress,
        street: fullAddress,
        experience: form.experience,
      }, { merge: true });

      login({...user,...form, category: form.categories.join(", ") });
      alert("✅ Profile updated");
      onClose();
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  const s={width:"100%", padding:14, borderRadius:8, border:"2px solid #888", fontSize:16, background:"#fff", color:"#000"};
  const filteredCats=CATEGORIES.filter(c=>c.en.toLowerCase().includes(catSearch.toLowerCase()));

  return (
    <div style={{ position:"fixed", inset:0, background:"#fff", padding:16, overflowY:"auto", zIndex:1000 }}>
      <div style={{maxWidth:500, margin:"auto"}}>
      <h3 style={{ marginBottom:20 }}>✏️ Edit Profile</h3>
      <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div><label>1. Business Name</label><input value={form.businessName} onChange={e=>setForm({...form,businessName:e.target.value})} style={s}/></div>
        <div><label>2. Name *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required style={{...s,borderColor:"blue"}}/></div>
        <div><label>3. Category *</label>
          <input value={catSearch} onChange={e=>{setCatSearch(e.target.value); setShowCat(true);}} onFocus={()=>setShowCat(true)} placeholder="plumber লিখো" style={s}/>
          {showCat && <div style={{maxHeight:180, overflowY:"auto", border:"1px solid #ccc"}}>{filteredCats.map(c=><label key={c.id} style={{display:"flex",gap:8,padding:10,borderBottom:"1px solid #eee"}}><input type="checkbox" checked={form.categoryIds.includes(c.id)} onChange={()=>toggleCategory(c)}/>{c.en}</label>)}</div>}
          <div style={{fontSize:12}}>Selected: {form.categories.join(", ")}</div>
        </div>
        <div><label>4. Experience</label><input value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})} style={s}/></div>
        <div style={{background:"#e8f5e9", padding:12, borderRadius:10, border:"2px solid green", display:"flex", flexDirection:"column", gap:12}}>
          <div><label>5. State *</label><select value={form.state} onChange={e=>setForm({...form,state:e.target.value, district:""})} required style={s}><option value="">Select State</option>{ALL_STATES.map((st,i)=><option key={i} value={st}>{st}</option>)}</select></div>
          <div><label>6. District *</label><select value={form.district} onChange={e=>setForm({...form,district:e.target.value})} required style={s}><option value="">Select District</option>{districts.map((d,i)=><option key={i} value={d}>{d}</option>)}</select>
          <input value={form.district} onChange={e=>setForm({...form,district:e.target.value})} placeholder="District না থাকলে এখানে লিখো" style={{...s,marginTop:8}}/></div>
          <div><label>7. Pin *</label><input value={form.pincode} onChange={e=>setForm({...form,pincode:e.target.value.replace(/\D/g,"").slice(0,6)})} required style={s}/></div>
          <div><label>8. P.S *</label><input value={form.ps} onChange={e=>setForm({...form,ps:e.target.value})} required style={{...s,borderColor:"blue"}}/></div>
          <div><label>9. P.O *</label><input value={form.po} onChange={e=>setForm({...form,po:e.target.value})} required style={{...s,borderColor:"blue"}}/></div>
          <div><label>10. Village *</label><input value={form.village} onChange={e=>setForm({...form,village:e.target.value})} required style={{...s,borderColor:"blue"}}/></div>
        </div>
        <div><label>Phone Locked</label><input value={form.phone} disabled style={{...s,background:"#eee"}}/></div>
        <button type="submit" style={{padding:14, background:"green", color:"#fff", border:"none", borderRadius:8, fontWeight:"bold"}}>💾 Save</button>
        <button type="button" onClick={onClose} style={{padding:14, background:"#aaa", color:"#fff", border:"none", borderRadius:8}}>Close</button>
      </form>
      </div>
    </div>
  );
}

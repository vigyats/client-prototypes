import { createContext, useContext, useEffect, useMemo, useState, PropsWithChildren } from "react";

export type Lang = "en" | "hi" | "mr";

const STORAGE_KEY = "ngo.lang";

const dict = {
  en: {
    brand: "Prayas Yavatmal",
    tagline: " ",
    nav: { home: "Home", projects: "Projects", events: "Events", admin: "Admin", about: "About", donate: "Donate Us" },
    actions: { login: "Admin Login", logout: "Logout", open: "Open", viewAll: "View all", create: "Create", update: "Update", uploadImage: "Upload Image", save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit" },
    labels: {
      featuredProjects: "Featured Projects",
      allProjects: "All Projects",
      events: "Events",
      upcoming: "Upcoming",
      previous: "Previous",
      language: "Language",
      cover: "Cover",
      translations: "Translations",
      contactUs: "Contact Us",
      gallery: "Gallery",
      theme: "Theme",
      adminPanel: "Admin Panel",
      dashboard: "Dashboard",
    },
    empty: {
      featured: "No featured projects yet.",
      projects: "No projects yet.",
      events: "No events yet.",
    },
    home: {
      heroTitle: "Prayas is an idea",
      heroSubtitle: "Empowering communities through selfless service and civic action",
      heroTagline: "Building a stronger, united India — one initiative at a time",
      highlights: "Highlights",
      missionLabel: "Our Mission",
      missionTitle: "Selfless service for stronger community",
      missionDesc: "Building a better tomorrow through dedicated civic action and community engagement across India. We believe in the power of collective effort to create lasting social change.",
      valueUnity: "Unity in Diversity",
      valueUnityDesc: "Bringing together people from all walks of life to work towards common goals for societal betterment.",
      valueInnovation: "Innovation & Action",
      valueInnovationDesc: "Implementing creative solutions to address civic challenges and drive meaningful community transformation.",
      valueSustainable: "Sustainable Growth",
      valueSustainableDesc: "Creating long-term impact through sustainable initiatives that empower communities and preserve our heritage.",
      footerDesc: "A civic NGO dedicated to empowering communities through selfless service and social initiatives across India.",
      footerQuickLinks: "Quick Links",
      footerConnect: "Connect",
      footerConnectDesc: "Join us in making a difference. Together, we can build a stronger, more united India.",
      footerRights: "All rights reserved.",
      badgeCommunity: "Community First",
      badgeCivic: "Civic Action",
      badgeImpact: "Social Impact",
    },
    about: {
      title: "Effort is a thought",
      subtitle: "To do something selflessly for society.",
      viewProjects: "View All Projects",
      joinMission: "Join Our Mission",
      joinDesc: "So, friends, let's all come together and do this environmental protection work, awaken the new generation, which will make life easier for the next generation.",
      content1: "And while doing this, a group of people who firmly believe that I am doing this work for my own good, not for anyone else is",
      content2: "And that is why the name Prayas Yavatmal, although it seems related to Yavatmal, has a very wide scope. The Prayas inspired by this thought are working all over the world with this thought.",
      content3: "the founder president of Prayas Sevankur Sanstha Amravati, who took up social work in his youth, is our source of inspiration, who showed us this path of happiness, gave us the strength to walk on it and is still standing firmly behind us.",
      content4: "With his inspiration, we started the first planned, monthly and inspiring",
      content4b: "program of dialogue with dream-mad people from April 2014 and it ran for 40 consecutive months. This program was also inspiring for us. That is why we jumped from dialogue to action, undertook various community-oriented projects and completed them. Even the failures in some work became a guide for us.",
      projectsTitle: "Our Projects",
      projectsDesc: "All these works were made possible only with the cooperation of all the citizens of Yavatmal, government officials, our countless friends and fans. Yavatmal will never forget to express their gratitude because it is with the cooperation of all of them that Yavatmal has taken a great effort to continue the work of environmental protection.",
    },
    donate: {
      title: "Make a Difference Today",
      subtitle: "Your contribution helps us continue our mission of selfless service and community empowerment across India.",
      howToContribute: "How to Contribute",
      bankTransfer: "Bank Transfer",
      accountName: "Account Name:",
      accountNumber: "Account Number:",
      ifscCode: "IFSC Code:",
      contactUs: "Contact Us",
      contactDesc: "For donation inquiries, tax exemption certificates, or to learn more about how your contribution makes an impact, please reach out to us through our contact channels.",
      scanToDonate: "Scan to Donate",
      upiQr: "UPI QR Code",
      thankYou: "Thank You for Your Support",
      thankYouDesc: "Every contribution, big or small, helps us continue our mission of building a stronger, more united India through selfless service and civic action.",
      communityDev: "Community Development",
      communityDevDesc: "Supporting local communities through education, healthcare, and infrastructure development initiatives.",
      socialWelfare: "Social Welfare",
      socialWelfareDesc: "Providing essential services and support to underprivileged sections of society.",
      envProtection: "Environmental Protection",
      envProtectionDesc: "Leading initiatives for environmental conservation and sustainable development.",
      youthEmp: "Youth Empowerment",
      youthEmpDesc: "Inspiring and guiding the next generation towards civic responsibility and social action.",
    },
  },
  hi: {
    brand: "प्रयास यवतमाल",
    tagline: " ",
    nav: { home: "होम", projects: "परियोजनाएँ", events: "कार्यक्रम", admin: "एडमिन", about: "हमारे बारे में", donate: "हमें दान करें" },
    actions: { login: "एडमिन लॉगिन", logout: "लॉगआउट", open: "खोलें", viewAll: "सभी देखें", create: "बनाएँ", update: "अपडेट", uploadImage: "छवि अपलोड करें", save: "सहेजें", cancel: "रद्द करें", delete: "हटाएं", edit: "संपादित करें" },
    labels: {
      featuredProjects: "विशेष परियोजनाएँ",
      allProjects: "सभी परियोजनाएँ",
      events: "कार्यक्रम",
      upcoming: "आगामी",
      previous: "पिछले",
      language: "भाषा",
      cover: "कवर",
      translations: "अनुवाद",
      contactUs: "हमसे संपर्क करें",
      gallery: "गैलरी",
      theme: "थीम",
      adminPanel: "एडमिन पैनल",
      dashboard: "डैशबोर्ड",
    },
    empty: {
      featured: "अभी कोई विशेष परियोजना नहीं है।",
      projects: "अभी कोई परियोजना नहीं है।",
      events: "अभी कोई कार्यक्रम नहीं है।",
    },
    home: {
      heroTitle: "प्रयास एक विचार है",
      heroSubtitle: "निःस्वार्थ सेवा और नागरिक कार्रवाई के माध्यम से समुदायों को सशक्त बनाना",
      heroTagline: "एक मजबूत, एकजुट भारत का निर्माण — एक पहल के साथ",
      highlights: "मुख्य बातें",
      missionLabel: "हमारा मिशन",
      missionTitle: "निःस्वार्थ सेवा से मजबूत समाज",
      missionDesc: "समर्पित नागरिक कार्रवाई और पूरे भारत में सामुदायिक भागीदारी के माध्यम से एक बेहतर कल का निर्माण। हम स्थायी सामाजिक परिवर्तन लाने के लिए सामूहिक प्रयास की शक्ति में विश्वास करते हैं।",
      valueUnity: "विविधता में एकता",
      valueUnityDesc: "समाज की बेहतरी के लिए सामान्य लक्ष्यों की दिशा में काम करने के लिए जीवन के सभी क्षेत्रों के लोगों को एक साथ लाना।",
      valueInnovation: "नवाचार और कार्रवाई",
      valueInnovationDesc: "नागरिक चुनौतियों का समाधान करने और सार्थक सामुदायिक परिवर्तन लाने के लिए रचनात्मक समाधान लागू करना।",
      valueSustainable: "सतत विकास",
      valueSustainableDesc: "सतत पहलों के माध्यम से दीर्घकालिक प्रभाव पैदा करना जो समुदायों को सशक्त बनाते हैं और हमारी विरासत को संरक्षित करते हैं।",
      footerDesc: "एक नागरिक एनजीओ जो पूरे भारत में निःस्वार्थ सेवा और सामाजिक पहलों के माध्यम से समुदायों को सशक्त बनाने के लिए समर्पित है।",
      footerQuickLinks: "त्वरित लिंक",
      footerConnect: "जुड़ें",
      footerConnectDesc: "बदलाव लाने में हमारे साथ जुड़ें। साथ मिलकर, हम एक मजबूत, अधिक एकजुट भारत का निर्माण कर सकते हैं।",
      footerRights: "सर्वाधिकार सुरक्षित।",
      badgeCommunity: "समुदाय पहले",
      badgeCivic: "नागरिक कार्रवाई",
      badgeImpact: "सामाजिक प्रभाव",
    },
    about: {
      title: "प्रयास एक विचार है",
      subtitle: "समाज के लिए निःस्वार्थ भाव से कुछ करना।",
      viewProjects: "सभी परियोजनाएँ देखें",
      joinMission: "हमारे मिशन में शामिल हों",
      joinDesc: "तो दोस्तों, आइए हम सब मिलकर यह पर्यावरण संरक्षण का काम करें, नई पीढ़ी को जागृत करें, जो अगली पीढ़ी के लिए जीवन को आसान बनाएगा।",
      content1: "और यह करते हुए, लोगों का एक समूह जो दृढ़ता से मानता है कि मैं यह काम अपनी भलाई के लिए कर रहा हूँ, किसी और के लिए नहीं",
      content2: "और इसीलिए प्रयास यवतमाल नाम, भले ही यह यवतमाल से संबंधित लगता है, लेकिन इसका दायरा बहुत व्यापक है। इस विचार से प्रेरित प्रयास पूरी दुनिया में इस विचार के साथ काम कर रहे हैं।",
      content3: "प्रयास सेवांकुर संस्था अमरावती के संस्थापक अध्यक्ष, जिन्होंने अपनी युवावस्था में समाज सेवा का काम शुरू किया, हमारे प्रेरणा स्रोत हैं, जिन्होंने हमें खुशी का यह रास्ता दिखाया, इस पर चलने की ताकत दी और अभी भी हमारे पीछे मजबूती से खड़े हैं।",
      content4: "उनकी प्रेरणा से, हमने अप्रैल 2014 से पहला योजनाबद्ध, मासिक और प्रेरणादायक",
      content4b: "कार्यक्रम शुरू किया जो सपनों के पागल लोगों के साथ संवाद का था और यह लगातार 40 महीनों तक चला। यह कार्यक्रम हमारे लिए भी प्रेरणादायक था। इसीलिए हम संवाद से कार्य में कूद पड़े, विभिन्न समुदाय-उन्मुख परियोजनाओं को हाथ में लिया और उन्हें पूरा किया। कुछ कामों में असफलताएं भी हमारे लिए मार्गदर्शक बनीं।",
      projectsTitle: "हमारी परियोजनाएँ",
      projectsDesc: "ये सभी काम यवतमाल के सभी नागरिकों, सरकारी अधिकारियों, हमारे अनगिनत दोस्तों और प्रशंसकों के सहयोग से ही संभव हो पाए। यवतमाल कभी नहीं भूलेगा कि उन सबके सहयोग से ही यवतमाल ने पर्यावरण संरक्षण का काम जारी रखने का बड़ा प्रयास किया है।",
    },
    donate: {
      title: "आज फर्क लाएं",
      subtitle: "आपका योगदान पूरे भारत में निःस्वार्थ सेवा और समुदाय सशक्तीकरण के हमारे मिशन को जारी रखने में मदद करता है।",
      howToContribute: "योगदान कैसे करें",
      bankTransfer: "बैंक ट्रांसफर",
      accountName: "खाता नाम:",
      accountNumber: "खाता नंबर:",
      ifscCode: "IFSC कोड:",
      contactUs: "हमसे संपर्क करें",
      contactDesc: "दान पूछताछ, कर छूट प्रमाणपत्र, या आपके योगदान के प्रभाव के बारे में अधिक जानने के लिए, कृपया हमारे संपर्क चैनलों के माध्यम से हमसे संपर्क करें।",
      scanToDonate: "दान करने के लिए स्कैन करें",
      upiQr: "UPI QR कोड",
      thankYou: "आपके समर्थन के लिए धन्यवाद",
      thankYouDesc: "प्रत्येक योगदान, चाहे बड़ा हो या छोटा, निःस्वार्थ सेवा और नागरिक कार्रवाई के माध्यम से एक मजबूत, अधिक एकजुट भारत बनाने के हमारे मिशन को जारी रखने में मदद करता है।",
      communityDev: "सामुदायिक विकास",
      communityDevDesc: "शिक्षा, स्वास्थ्य सेवा और बुनियादी ढांचा विकास पहलों के माध्यम से स्थानीय समुदायों का समर्थन।",
      socialWelfare: "सामाजिक कल्याण",
      socialWelfareDesc: "समाज के वंचित वर्गों को आवश्यक सेवाएं और समर्थन प्रदान करना।",
      envProtection: "पर्यावरण संरक्षण",
      envProtectionDesc: "पर्यावरण संरक्षण और सतत विकास के लिए पहल का नेतृत्व।",
      youthEmp: "युवा सशक्तीकरण",
      youthEmpDesc: "नागरिक जिम्मेदारी और सामाजिक कार्रवाई की दिशा में अगली पीढ़ी को प्रेरित और मार्गदर्शन करना।",
    },
  },
  mr: {
    brand: "प्रयास यवतमाळ",
    tagline: " ",
    nav: { home: "मुख्य", projects: "प्रकल्प", events: "कार्यक्रम", admin: "अॅडमिन", about: "आमच्याबद्दल", donate: "आम्हाला देणगी द्या" },
    actions: { login: "अॅडमिन लॉगिन", logout: "लॉगआउट", open: "उघडा", viewAll: "सर्व पहा", create: "तयार करा", update: "अपडेट", uploadImage: "प्रतिमा अपलोड करा", save: "जतन करा", cancel: "रद्द करा", delete: "हटवा", edit: "संपादित करा" },
    labels: {
      featuredProjects: "वैशिष्ट्यपूर्ण प्रकल्प",
      allProjects: "सर्व प्रकल्प",
      events: "कार्यक्रम",
      upcoming: "आगामी",
      previous: "मागील",
      language: "भाषा",
      cover: "कव्हर",
      translations: "भाषांतर",
      contactUs: "आमच्याशी संपर्क साधा",
      gallery: "गॅलरी",
      theme: "थीम",
      adminPanel: "अॅडमिन पॅनेल",
      dashboard: "डॅशबोर्ड",
    },
    empty: {
      featured: "सध्या कोणतेही वैशिष्ट्यपूर्ण प्रकल्प नाहीत.",
      projects: "सध्या कोणतेही प्रकल्प नाहीत.",
      events: "सध्या कोणतेही कार्यक्रम नाहीत.",
    },
    home: {
      heroTitle: "प्रयास ही एक कल्पना आहे",
      heroSubtitle: "निःस्वार्थ सेवा आणि नागरी कृती द्वारे समुदायांना सशक्त करणे",
      heroTagline: "एक मजबूत, एकसंध भारत तयार करणे — एका वेळी एक उपक्रम",
      highlights: "ठळक वैशिष्ट्ये",
      missionLabel: "आमचे ध्येय",
      missionTitle: "निःस्वार्थ सेवेद्वारे मजबूत समाज",
      missionDesc: "समर्पित नागरी कृती आणि संपूर्ण भारतातील सामुदायिक सहभागाद्वारे एक चांगला उद्या तयार करणे. आम्ही शाश्वत सामाजिक बदल घडवून आणण्यासाठी सामूहिक प्रयत्नांच्या शक्तीवर विश्वास ठेवतो.",
      valueUnity: "विविधतेत एकता",
      valueUnityDesc: "सामाजिक सुधारणेसाठी समान उद्दिष्टांच्या दिशेने काम करण्यासाठी जीवनाच्या सर्व क्षेत्रातील लोकांना एकत्र आणणे.",
      valueInnovation: "नवकल्पना आणि कृती",
      valueInnovationDesc: "नागरी आव्हानांना तोंड देण्यासाठी आणि अर्थपूर्ण सामुदायिक परिवर्तन घडवून आणण्यासाठी सर्जनशील उपाय राबवणे.",
      valueSustainable: "शाश्वत विकास",
      valueSustainableDesc: "शाश्वत उपक्रमांद्वारे दीर्घकालीन प्रभाव निर्माण करणे जे समुदायांना सशक्त करतात आणि आमचा वारसा जतन करतात.",
      footerDesc: "संपूर्ण भारतात निःस्वार्थ सेवा आणि सामाजिक उपक्रमांद्वारे समुदायांना सशक्त करण्यासाठी समर्पित एक नागरी एनजीओ.",
      footerQuickLinks: "द्रुत दुवे",
      footerConnect: "जोडा",
      footerConnectDesc: "फरक करण्यासाठी आमच्यासोबत सामील व्हा. एकत्रितपणे, आम्ही एक मजबूत, अधिक एकसंध भारत तयार करू शकतो.",
      footerRights: "सर्व हक्क राखीव.",
      badgeCommunity: "समुदाय प्रथम",
      badgeCivic: "नागरी कृती",
      badgeImpact: "सामाजिक प्रभाव",
    },
    about: {
      title: "प्रयत्न ही एक विचार आहे",
      subtitle: "समाजासाठी निःस्वार्थपणे काहीतरी करणे.",
      viewProjects: "सर्व प्रकल्प पहा",
      joinMission: "आमच्या ध्येयात सामील व्हा",
      joinDesc: "तर मित्रांनो, आपण सर्वजण एकत्र येऊन हे पर्यावरण संरक्षणाचे काम करू, नवीन पिढीला जागृत करू, जे पुढच्या पिढीसाठी जीवन सोपे करेल.",
      content1: "आणि हे करताना, लोकांचा एक गट जो दृढपणे मानतो की मी हे काम माझ्या स्वतःच्या भल्यासाठी करत आहे, कोणासाठी नाही",
      content2: "आणि म्हणूनच प्रयास यवतमाळ नाव, जरी ते यवतमाळशी संबंधित वाटत असले तरी, पण त्याची व्याप्ती खूप विस्तृत आहे. या विचाराने प्रेरित प्रयास जगभरात या विचारासह काम करत आहेत.",
      content3: "प्रयास सेवांकुर संस्था अमरावतीचे संस्थापक अध्यक्ष, ज्यांनी आपल्या तारुण्यात समाजसेवेचे काम सुरू केले, आमचे प्रेरणास्त्रोत आहेत, ज्यांनी आम्हाला आनंदाचा हा मार्ग दाखवला, त्यावर चालण्याची ताकद दिली आणि आजही आमच्या मागे दृढपणे उभे आहेत.",
      content4: "त्यांच्या प्रेरणेने, आम्ही एप्रिल 2014 पासून पहिला नियोजित, मासिक आणि प्रेरणादायक",
      content4b: "कार्यक्रम सुरू केला जो स्वप्नांच्या वेड्या लोकांशी संवादाचा होता आणि तो सलग 40 महिने चालला. हा कार्यक्रम आमच्यासाठीही प्रेरणादायक होता. म्हणूनच आम्ही संवादातून कृतीत उडी मारली, विविध समुदाय-केंद्रित प्रकल्प हाती घेतले आणि ते पूर्ण केले. काही कामांमध्ये अपयशही आमच्यासाठी मार्गदर्शक ठरले.",
      projectsTitle: "आमचे प्रकल्प",
      projectsDesc: "ही सर्व कामे यवतमाळच्या सर्व नागरिकांच्या, सरकारी अधिकार्यांच्या, आमच्या असंख्य मित्रांच्या आणि चाहत्यांच्या सहकार्यानेच शक्य झाली. यवतमाळ कधी विसरणार नाही की त्या सर्वांच्या सहकार्यानेच यवतमाळने पर्यावरण संरक्षणाचे काम चालू ठेवण्याचा मोठा प्रयत्न केला आहे.",
    },
    donate: {
      title: "आज फरक करा",
      subtitle: "तुमचे योगदान संपूर्ण भारतात निःस्वार्थ सेवा आणि समुदाय सशक्तीकरणाचे आमचे ध्येय चालू ठेवण्यास मदत करते.",
      howToContribute: "योगदान कसे द्यावे",
      bankTransfer: "बॅंक ट्रान्सफर",
      accountName: "खाते नाव:",
      accountNumber: "खाते क्रमांक:",
      ifscCode: "IFSC कोड:",
      contactUs: "आमच्याशी संपर्क साधा",
      contactDesc: "देणगी चौकशी, कर सवलत प्रमाणपत्रे, किंवा तुमच्या योगदानाचा प्रभाव जाणून घेण्यासाठी, कृपया आमच्या संपर्क चॅनेलद्वारे आमच्याशी संपर्क साधा.",
      scanToDonate: "देणगी देण्यासाठी स्कॅन करा",
      upiQr: "UPI QR कोड",
      thankYou: "तुमच्या समर्थनाबद्दल धन्यवाद",
      thankYouDesc: "प्रत्येक योगदान, मोठे किंवा लहान, निःस्वार्थ सेवा आणि नागरी कृतीद्वारे एक मजबूत, अधिक एकसंध भारत तयार करण्याचे आमचे ध्येय चालू ठेवण्यास मदत करते.",
      communityDev: "सामुदायिक विकास",
      communityDevDesc: "शिक्षण, आरोग्य सेवा आणि पायाभूत सुविधा विकास उपक्रमांद्वारे स्थानिक समुदायांना समर्थन.",
      socialWelfare: "सामाजिक कल्याण",
      socialWelfareDesc: "समाजाच्या वंचित घटकांना आवश्यक सेवा आणि समर्थन पुरवणे.",
      envProtection: "पर्यावरण संरक्षण",
      envProtectionDesc: "पर्यावरण संरक्षण आणि शाश्वत विकासासाठी उपक्रमांचे नेतृत्व.",
      youthEmp: "युवा सशक्तीकरण",
      youthEmpDesc: "नागरी जबाबदारी आणि सामाजिक कृतीकडे पुढच्या पिढीला प्रेरणा आणि मार्गदर्शन.",
    },
  },
} as const;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: typeof dict.en;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: PropsWithChildren) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "hi" || stored === "mr") setLang(stored as Lang);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useMemo(() => dict[lang], [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}

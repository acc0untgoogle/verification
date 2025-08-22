const levels = [
  {
    name: "بسيطة… للوهلة الأولى",
    instruction: "اذهب إلى الباب للفوز",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "العالم مقلوب",
    instruction: "الجاذبية للأعلى",
    gravity: -300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "عكس كل شيء",
    instruction: "التحكم معكوس + القفز ضعيف",
    gravity: 300,
    invertedControls: true,
    winCondition: "reachDoor"
  },
  {
    name: "الباب لا يُرى",
    instruction: "الباب مخفي",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "الموت خلاص",
    instruction: "قف على المسامير لتربح",
    gravity: 300,
    invertedControls: false,
    winCondition: "die"
  },
  {
    name: "قفزتان فقط",
    instruction: "لديك قفزتان",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "أرض زلقة",
    instruction: "الحركة صعبة",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "أين الأرض؟",
    instruction: "المنصات تختفي بعد لمسها",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "أعلى فأعلى",
    instruction: "الجاذبية ضعيفة",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "بدون قفز",
    instruction: "لا يمكنك القفز",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "قفزة عكسية",
    instruction: "القفز ينزلك",
    gravity: 300,
    invertedControls: true,
    winCondition: "reachDoor"
  },
  {
    name: "أشباح المسامير",
    instruction: "المسامير غير مرئية",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "باب غشاش",
    instruction: "بعض الأبواب مزيفة",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "الوقت يقتل",
    instruction: "عندك ثانيتين فقط",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "بوابة الموت",
    instruction: "مت قبل الفوز",
    gravity: 300,
    invertedControls: false,
    winCondition: "die"
  },
  {
    name: "التحكم مختلط",
    instruction: "الأزرار لا تعمل كالمعتاد",
    gravity: 300,
    invertedControls: true,
    winCondition: "reachDoor"
  },
  {
    name: "قفزة لا نهائية",
    instruction: "اضغط باستمرار للقفز دائمًا",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "الأرض مصيدة",
    instruction: "المنصات تسقط",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "كل شيء يختفي",
    instruction: "حتى أنت شفاف",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "انعكاس كامل",
    instruction: "الشاشة معكوسة",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "أرضية مشوهة",
    instruction: "القفز غير متوقع",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "أبواب متعددة",
    instruction: "اختر الباب الصحيح",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "قفزة محدودة",
    instruction: "قفزة واحدة فقط",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "وقت بطيء",
    instruction: "كل شيء بطيء",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "وقت سريع",
    instruction: "كل شيء سريع جدًا",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "الجدار هو الحل",
    instruction: "تسلق الجدران",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "مفتاح سري",
    instruction: "اضغط زر معين لإظهار الباب",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "الموت مرتين",
    instruction: "مت مرتين للفوز",
    gravity: 300,
    invertedControls: false,
    winCondition: "dieTwice"
  },
  {
    name: "قفزة معكوسة",
    instruction: "الزر ↑ يجعلك تنزل",
    gravity: 300,
    invertedControls: false,
    winCondition: "reachDoor"
  },
  {
    name: "النهاية",
    instruction: "مبروك! أنهيت اللعبة",
    gravity: 300,
    invertedControls: false,
    winCondition: "end"
  }
];
(function () {

  const books = [
    //
    // OT
    //
    {
      path: 'ot/gen',
      name: 'Genesis'
    },
    {
      path: 'ot/ex',
      name: 'Exodus'
    },
    {
      path: 'ot/lev',
      name: 'Leviticus'
    },
    {
      path: 'ot/num',
      name: 'Numbers'
    },
    {
      path: 'ot/josh',
      name: 'Joshua'
    },
    {
      path: 'ot/judg',
      name: 'Judges'
    },
    {
      path: 'ot/ruth',
      name: 'Ruth'
    },
    {
      path: 'ot/isa',
      name: 'Isaiah'
    },
    {
      path: 'ot/1-sam',
      name: '1 Samuel'
    },
    {
      path: 'ot/2-sam',
      name: '2 Samuel'
    },
    {
      path: 'ot/1-kgs',
      name: '1 Kings'
    },
    {
      path: 'ot/2-kgs',
      name: '2 Kings'
    },
    {
      path: 'ot/1-chr',
      name: '1 Chronicles'
    },
    {
      path: 'ot/2-chr',
      name: '2 Chronicles'
    },
    {
      path: 'ot/ezra',
      name: 'Ezra'
    },
    {
      path: 'ot/neh',
      name: 'Nehemiah'
    },
    {
      path: 'ot/esth',
      name: 'Esther'
    },
    {
      path: 'ot/job',
      name: 'Job'
    },
    {
      path: 'ot/ps',
      name: 'Psalm'
    },
    {
      path: 'ot/prov',
      name: 'Proverbs'
    },
    {
      path: 'ot/eccl',
      name: 'Ecclesiastes'
    },
    {
      path: 'ot/song',
      name: 'Song of Solomon'
    },
    {
      path: 'ot/isa',
      name: 'Isaiah'
    },
    {
      path: 'ot/jer',
      name: 'Jeremiah'
    },
    {
      path: 'ot/lam',
      name: 'Lamentations'
    },
    {
      path: 'ot/ezek',
      name: 'Ezekiel'
    },
    {
      path: 'ot/dan',
      name: 'Daniel'
    },
    {
      path: 'ot/hodea',
      name: 'Hosea'
    },
    {
      path: 'ot/joel',
      name: 'Joel'
    },
    {
      path: 'ot/amos',
      name: 'Amos'
    },
    {
      path: 'ot/obad',
      name: 'Obadiah'
    },
    {
      path: 'ot/jonah',
      name: 'Jonah'
    },
    {
      path: 'ot/micah',
      name: 'Micah'
    },
    {
      path: 'ot/nahum',
      name: 'Nahum'
    },
    {
      path: 'ot/hab',
      name: 'Habakkuk'
    },
    {
      path: 'ot/seph',
      name: 'Zephania'
    },
    {
      path: 'ot/hag',
      name: 'Haggai'
    },
    {
      path: 'ot/zech',
      name: 'Zechariah'
    },
    {
      path: 'ot/mal',
      name: 'Malachi'
    },
    //
    // NT
    //
    {
      path: 'nt/matt',
      name: 'Matthew'
    },
    {
      path: 'nt/mark',
      name: 'Mark'
    },
    {
      path: 'nt/luke',
      name: 'Luke'
    },
    {
      path: 'nt/john',
      name: 'John'
    },
    {
      path: 'nt/acts',
      name: 'Acts'
    },
    {
      path: 'nt/rom',
      name: 'Romans'
    },
    {
      path: 'nt/1-cor',
      name: '1 Corinthians'
    },
    {
      path: 'nt/2-cor',
      name: '2 Corinthians'
    },
    {
      path: 'nt/gal',
      name: 'Galatians'
    },
    {
      path: 'nt/eph',
      name: 'Ephesians'
    },
    {
      path: 'nt/philip',
      name: 'Philippians'
    },
    {
      path: 'nt/col',
      name: 'Colossians'
    },
    {
      path: 'nt/1-thes',
      name: '1 Thessalonians'
    },
    {
      path: 'nt/2-thes',
      name: '2 Thessalonians'
    },
    {
      path: 'nt/1-tim',
      name: '1 Timothy'
    },
    {
      path: 'nt/2-tim',
      name: '2 Timothy'
    },
    {
      path: 'nt/titus',
      name: 'Titus'
    },
    {
      path: 'nt/philem',
      name: 'Philemon'
    },
    {
      path: 'nt/heb',
      name: 'Hebrews'
    },
    {
      path: 'nt/james',
      name: 'James'
    },
    {
      path: 'nt/1-pet',
      name: '1 Peter'
    },
    {
      path: 'nt/2-pet',
      name: '2 Peter'
    },
    {
      path: 'nt/1-jn',
      name: '1 John'
    },
    {
      path: 'nt/2-jn',
      name: '2 John'
    },
    {
      path: 'nt/3-jn',
      name: '3 John'
    },
    {
      path: 'nt/jude',
      name: 'Jude'
    },
    {
      path: 'nt/rev',
      name: 'Revelation'
    },
    //
    // Book of Mormom
    //
    {
      path: 'bofm/1-ne',
      name: '1 Nephi'
    },
    {
      path: 'bofm/2-ne',
      name: '2 Nephi'
    },
    {
      path: 'bofm/jacob',
      name: 'Jacob'
    },
    {
      path: 'bofm/enos',
      name: 'Enos'
    },
    {
      path: 'bofm/jarom',
      name: 'Jarom'
    },
    {
      path: 'bofm/omni',
      name: 'Omni'
    },
    {
      path: 'bofm/w-of-m',
      name: 'Words of Mormon'
    },
    {
      path: 'bofm/mosiah',
      name: 'Mosiah'
    },
    {
      path: 'bofm/alma',
      name: 'Alma'
    },
    {
      path: 'bofm/hel',
      name: 'Helaman'
    },
    {
      path: 'bofm/3-ne',
      name: '3 Nephi'
    },
    {
      path: 'bofm/4-ne',
      name: '4 Nephi'
    },
    {
      path: 'bofm/morm',
      name: 'Mormon'
    },
    {
      path: 'bofm/ether',
      name: 'Ether'
    },
    {
      path: 'bofm/moro',
      name: 'Moroni'
    },
    //
    // Doctrine and Covenants
    //
    {
      path: 'dc-testament/dc',
      name: 'D&C'
    },
    //
    // Pearl of Great Price
    //
    {
      path: 'pgp/moses',
      name: 'Moses'
    },
    {
      path: 'pgp/abr',
      name: 'Abraham'
    },
    {
      path: 'pgp/js-m',
      name: 'JST Matt'
    },
    {
      path: 'pgp/js-h',
      name: 'JS History'
    },
    {
      path: 'pgp/a-of-f',
      name: 'Articles of Faith'
    },
  ];

  // Generate regex for each book
  books.forEach((book) => {
    book.regex = new RegExp(`${book.name} (\\w+)(:((\\w+)(-\\w+)?))?`, 'gm')
  })

  window.ScriptureLinks = {

    /**
     * Scans the given text for scripture references, 
     * then turns them into links to the scriptures
     * at churchofjesuschrist.org
     * 
     * @param {String} searchText Text to process
     * @returns {String}
     */
    addLinks: function (searchText) {
      let matches = [], url, matchText, chapter, verses, firstVerse;
      // Find all matches before processing so that our modifications
      // don't interfere with regex evaluation
      books.forEach((book) => {
        while ((match = book.regex.exec(searchText)) !== null) {
          match.book = book;
          matches.push(match);
        }
      })
      matches.forEach((match) => {
        matchText = match[0]
        chapter = match[1]
        verses = match[3]
        firstVerse = match[4]
        url = constructUrl(match.book, chapter, verses, firstVerse)
        searchText = searchText.replace(matchText, `<a href="${url}" target="_blank">${matchText}</a>`)
      })
      return searchText;
    }

  };

  function constructUrl(book, chapter, verses, firstVerse) {
    if (verses && firstVerse)
      return `https://www.churchofjesuschrist.org/study/scriptures/${book.path}/${chapter}.${verses}?lang=eng#p${firstVerse}`
    else if (verses) {
      return `https://www.churchofjesuschrist.org/study/scriptures/${book.path}/${chapter}.${verses}?lang=eng`
    } else {
      return `https://www.churchofjesuschrist.org/study/scriptures/${book.path}/${chapter}?lang=eng`
    }
  }

}());
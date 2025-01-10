// إعداد Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA2JEaM-mbGKpV2PjAyHqMH42GpUSSc8mM",
    authDomain: "bionic-baton-415013.firebaseapp.com",
    databaseURL: "https://bionic-baton-415013-default-rtdb.firebaseio.com",
    projectId: "bionic-baton-415013",
    storageBucket: "bionic-baton-415013.appspot.com",
    messagingSenderId: "946810274047",
    appId: "1:946810274047:web:a555c7b2db470f8c828cca",
    measurementId: "G-N3JESN08H1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage = firebase.storage();

window.onload = function () {
    loadArticles();
    loadBooks();
}

function createArticle() {
    const articleDiv = document.createElement('div');
    articleDiv.className = 'article';
    articleDiv.innerHTML = `
            <div class="title" contenteditable="true">اكتب عنوان المقال هنا...</div>
            <div class="art_body" contenteditable="true" style="border: 1px solid #ccc; padding: 10px; min-height: 100px; margin-bottom: 10px;">اكتب المقال هنا...</div>
            <div class="rating">
                <span class="star" onclick="rateArticle(this, 1)">★</span>
                <span class="star" onclick="rateArticle(this, 2)">★</span>
                <span class="star" onclick="rateArticle(this, 3)">★</span>
                <span class="star" onclick="rateArticle(this, 4)">★</span>
                <span class="star" onclick="rateArticle(this, 5)">★</span>
            </div>
            <div class="buttons">
                <button onclick="deleteArticle(this)">حذف مقال</button>
                <button onclick="saveArticle(this)">حفظ على Firebase</button>
            </div>`;
    document.getElementById('articles').prepend(articleDiv); // إضافة المقال في البداية
}

function deleteArticle(button) {
    const article = button.parentElement.parentElement;
    const title = article.querySelector('.title').innerText;

    if (confirm(`هل أنت متأكد أنك تريد حذف المقال "${title}"؟`)) {
        // حذف المقال من Firebase
        const articleRef = database.ref('articles').orderByChild('title').equalTo(title);
        articleRef.once('value', snapshot => {
            snapshot.forEach(childSnapshot => {
                childSnapshot.ref.remove();
            });
        });

        article.remove();
    }
}

function saveArticle(button) {
    const article = button.parentElement.parentElement;
    const title = article.querySelector('.title').innerText;
    const content = article.querySelector('.art_body').innerText;

    const newArticleRef = database.ref('articles').push();
    newArticleRef.set({
        title: title,
        content: content,
        timestamp: Date.now() // إضافة الطابع الزمني
    }).then(() => {
        alert('تم حفظ المقال');
    }).catch((error) => {
        console.error('خطأ في حفظ المقال:', error);
    });
}
function updateArticle(button, ids) {
    const article = button.parentElement.parentElement;
    const title = article.querySelector('.title').innerText;
    const content = article.querySelector('.art_body').innerText;
    console.log(article.childNodes)
    const newArticleRef = database.ref('articles/' + ids);
    newArticleRef.set({
        title: title,
        content: content,
        timestamp: Date.now() // إضافة الطابع الزمني
    }).then(() => {
        alert('تم حفظ المقال');
    }).catch((error) => {
        console.error('خطأ في حفظ المقال:', error);
    });
}

function loadArticles() {
    var ids = 0;
    database.ref('articles').orderByChild('timestamp').once('value').then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
            var parentName = Object.keys(snapshot.val())[ids];
            ids += 1;
            const data = childSnapshot.val();
            const articleDiv = document.createElement('div');
            articleDiv.className = 'article';
            articleDiv.innerHTML = `
                    <div class="title" contenteditable="true">${data.title}</div>
                    <div class="art_body" contenteditable="true" style="border: 1px solid #ccc; padding: 10px; min-height: 100px; margin-bottom: 10px;">${data.content}</div>
                    <div class="buttons">
                        <button onclick="deleteArticle(this)">حذف مقال</button>
                        <button onclick="updateArticle(this,'${parentName}')">تحديث المقال</button>
                    </div>`;
            document.getElementById('articles').prepend(articleDiv); // إضافة المقال في البداية
        });
    }).catch((error) => {
        console.error('خطأ في تحميل المقالات:', error);
    });
}

function uploadPDF() {
    const fileInput = document.getElementById('pdfUpload');
    const file = fileInput.files[0];
    if (!file) {
        alert('يرجى اختيار ملف PDF أولاً.');
        return;
    }

    const storageRef = storage.ref('books/' + file.name);
    storageRef.put(file).then(() => {
        alert('تم رفع الكتاب بنجاح.');
        loadBooks(); // إعادة تحميل الكتب بعد الرفع
    }).catch((error) => {
        console.error('خطأ في رفع الكتاب:', error);
    });
}

function loadBooks() {
    const bookList = document.getElementById('bookList');
    bookList.innerHTML = ''; // إعادة تعيين القائمة

    storage.ref('books/').listAll().then((result) => {
        result.items.forEach((itemRef) => {
            itemRef.getDownloadURL().then((url) => {
                const bookBox = document.createElement('div');
                bookBox.className = 'book-box';
                bookBox.textContent = itemRef.name.replaceAll('_', " "); // اسم الكتاب
                bookBox.onclick = function () {
                    loadPDFFromLink(url); // تحميل الكتاب في iframe
                };

                // إضافة زر لحذف الكتاب
                const deleteButton = document.createElement('button');
                deleteButton.className = 'deleteBook';
                deleteButton.textContent = 'حذف الكتاب';
                deleteButton.onclick = function (event) {
                    event.stopPropagation(); // منع تفعيل الحدث عند النقر
                    if (confirm(`هل أنت متأكد أنك تريد حذف الكتاب "${itemRef.name}"؟`)) {
                        storage.ref('books/' + itemRef.name).delete().then(() => {
                            alert('تم حذف الكتاب بنجاح.');
                            loadBooks(); // إعادة تحميل الكتب بعد الحذف
                        }).catch((error) => {
                            console.error('خطأ في حذف الكتاب:', error);
                        });
                    }
                };

                bookBox.appendChild(deleteButton);
                bookList.appendChild(bookBox);
            });
        });
    }).catch((error) => {
        console.error('خطأ في تحميل الكتب:', error);
    });
}

function loadPDFFromLink(url) {
    const pdfDisplay = document.getElementById('pdfDisplay');
    pdfDisplay.src = url; // عرض الكتاب في iframe
}

function searchArticles() {
    const searchInput = document.getElementById('articleSearch').value.toLowerCase();
    const articles = document.querySelectorAll('#articles .article');
    articles.forEach(article => {
        const title = article.querySelector('.title').innerText.toLowerCase();
        article.style.display = title.includes(searchInput) ? '' : 'none';
    });
}

function searchBooks() {
    const searchInput = document.getElementById('bookSearch').value.toLowerCase();
    const bookBoxes = document.querySelectorAll('.book-box');
    bookBoxes.forEach(box => {
        const bookName = box.textContent.toLowerCase();
        box.style.display = bookName.includes(searchInput) ? '' : 'none';
    });
}

function rateArticle(starElement, rating) {
    const article = starElement.closest('.article');
    const title = article.querySelector('.title').innerText;
    alert(`تم تقييم المقال "${title}" بـ ${rating} نجوم!`);
    // يمكنك هنا إضافة الكود للحفظ في Firebase إذا كنت ترغب في ذلك
}

function page(p) {
    $('.side').hide();
    $('#' + p).fadeIn();
}

document.getElementById('translateButton').addEventListener('click', async function () {
    const text = document.getElementById('eng_txt').innerHTML;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ar`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.responseData) {
            document.getElementById('ar_txt').innerHTML = data.responseData.translatedText;
        } else {
            document.getElementById('ar_txt').innerHTML = 'Translation failed.';
        }
    } catch (error) {
        document.getElementById('ar_txt').innerHTML = `Error: ${error.message}`;
    }
});
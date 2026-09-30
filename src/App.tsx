import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
    ArrowRight,
    CalendarDays,
    Check,
    ChevronRight,
    Clock3,
    MapPin,
    Plus,
    Search,
    Share2,
    Sparkles,
    Users,
    X,
} from 'lucide-react'

type Category = 'Spor' | 'Ders çalışma' | 'Oyun' | 'Müzik' | 'Sosyal'
type Accent = 'mint' | 'peach' | 'sky' | 'yellow' | 'coral'

type EventItem = {
    id: string
    title: string
    category: Category
    location: string
    date: string
    time: string
    description: string
    attendees: number
    capacity: number
    host: string
    accent: Accent
    joined?: boolean
}

type EventForm = Omit<EventItem, 'id' | 'attendees' | 'host' | 'accent' | 'joined'>

const categories: Array<{ label: Category | 'Tümü'; icon: string }> = [
    { label: 'Tümü', icon: '✦' },
    { label: 'Spor', icon: '◒' },
    { label: 'Ders çalışma', icon: '⌁' },
    { label: 'Oyun', icon: '♜' },
    { label: 'Müzik', icon: '♪' },
    { label: 'Sosyal', icon: '○' },
]

const starterEvents: EventItem[] = [
    {
        id: 'basketbol-park', title: 'Akşamüstü basketbol', category: 'Spor', location: 'Maçka Parkı', date: 'Bugün', time: '18:30',
        description: 'İki pota, bolca hareket. Seviyen ne olursa olsun gel, takımları orada kurarız.', attendees: 7, capacity: 10, host: 'Deniz', accent: 'mint',
    },
    {
        id: 'study-cafe', title: 'Birlikte odaklanalım', category: 'Ders çalışma', location: 'Kolektif Kadıköy', date: 'Yarın', time: '14:00',
        description: 'Telefonları sessize alıp 50 dakika odak, 10 dakika sohbet. Yanına çalıştığın şeyi alman yeterli.', attendees: 12, capacity: 18, host: 'Ece', accent: 'peach',
    },
    {
        id: 'board-games', title: 'Kutu oyunları gecesi', category: 'Oyun', location: 'Moda Sahnesi yanı', date: 'Cumartesi', time: '19:00',
        description: 'Yeni insanlarla tanışıp sevdiğimiz oyunları oynuyoruz. Catan, Dixit ve daha fazlası masada.', attendees: 9, capacity: 14, host: 'Berk', accent: 'sky',
    },
    {
        id: 'open-mic', title: 'Açık mikrofon akşamı', category: 'Müzik', location: 'Bina Kadıköy', date: 'Pazar', time: '20:00',
        description: 'Sahne senin. Dinlemeye, çalmaya veya sadece iyi müziğe eşlik etmeye bekleriz.', attendees: 21, capacity: 40, host: 'Lara', accent: 'yellow',
    },
    {
        id: 'picnic', title: 'Çimlerde tanışalım', category: 'Sosyal', location: 'Yoğurtçu Parkı', date: 'Pazar', time: '12:00',
        description: 'Herkes atıştırmalığını ve açık havaya uygun ruh halini getirsin. Yeni yüzlerle sakin bir pazar.', attendees: 15, capacity: 25, host: 'Mert', accent: 'coral',
    },
]

const storageKey = 'birlikte-yap-events'

function readEvents(): EventItem[] {
    const saved = localStorage.getItem(storageKey)
    if (!saved) return starterEvents
    try {
        return JSON.parse(saved) as EventItem[]
    } catch {
        return starterEvents
    }
}

function App() {
    const [events, setEvents] = useState<EventItem[]>(readEvents)
    const [activeCategory, setActiveCategory] = useState<Category | 'Tümü'>('Tümü')
    const [location, setLocation] = useState('Kadıköy')
    const [query, setQuery] = useState('')
    const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [notice, setNotice] = useState('')
    const [formError, setFormError] = useState('')
    const [form, setForm] = useState<EventForm>({ title: '', category: 'Sosyal', location: 'Kadıköy', date: '', time: '', description: '', capacity: 10 })

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(events))
    }, [events])

    const filteredEvents = useMemo(() => events.filter((event) => {
        const matchesCategory = activeCategory === 'Tümü' || event.category === activeCategory
        const matchesLocation = !location.trim() || event.location.toLocaleLowerCase('tr-TR').includes(location.toLocaleLowerCase('tr-TR'))
        const searchable = `${event.title} ${event.location} ${event.description}`.toLocaleLowerCase('tr-TR')
        return matchesCategory && matchesLocation && (!query.trim() || searchable.includes(query.toLocaleLowerCase('tr-TR')))
    }), [activeCategory, events, location, query])

    function updateForm(field: keyof EventForm, value: string | number) {
        setForm((current) => ({ ...current, [field]: value }))
    }

    function handleCreate(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!form.title.trim() || !form.location.trim() || !form.date || !form.time || !form.description.trim() || form.capacity < 2) {
            setFormError('Lütfen tüm alanları doldur ve en az 2 kişilik bir kapasite seç.')
            return
        }
        const newEvent: EventItem = {
            ...form,
            id: `event-${Date.now()}`,
            title: form.title.trim(), location: form.location.trim(), description: form.description.trim(), attendees: 1,
            host: 'Sen', accent: 'coral', joined: true,
        }
        setEvents((current) => [newEvent, ...current])
        setSelectedEvent(newEvent)
        setForm({ title: '', category: 'Sosyal', location: 'Kadıköy', date: '', time: '', description: '', capacity: 10 })
        setFormError('')
        setIsCreateOpen(false)
        setNotice('Etkinliğin oluşturuldu ve listeye eklendi.')
        window.setTimeout(() => setNotice(''), 3500)
    }

    function joinEvent(eventId: string) {
        setEvents((current) => current.map((event) => event.id === eventId && !event.joined && event.attendees < event.capacity
            ? { ...event, attendees: event.attendees + 1, joined: true } : event))
        setSelectedEvent((current) => current && current.id === eventId ? { ...current, attendees: current.joined ? current.attendees : current.attendees + 1, joined: true } : current)
    }

    async function shareApp() {
        const shareData = { title: 'Birlikte Yap', text: 'Yakınındaki etkinlikleri keşfet ve birlikte katılacak kişiler bul.', url: window.location.href }
        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(window.location.href)
                setNotice('Uygulama bağlantısı panoya kopyalandı.')
                window.setTimeout(() => setNotice(''), 3500)
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') return
            setNotice('Paylaşım şu anda kullanılamıyor.')
            window.setTimeout(() => setNotice(''), 3500)
        }
    }

    return (
        <div className="app-shell">
            <header className="topbar">
                <a className="brand" href="#top" aria-label="Birlikte Yap ana sayfa"><span className="brand-mark"><Sparkles size={16} /></span><span>birlikte<span>yap</span></span></a>
                <nav className="topnav"><a className="active" href="#kesfet">Keşfet</a><a href="#topluluk">Topluluk</a></nav>
                <button className="share-button" onClick={shareApp}><Share2 size={16} /> Paylaş</button>
                <button className="create-button" onClick={() => setIsCreateOpen(true)}><Plus size={18} /> Etkinlik oluştur</button>
            </header>

            <main id="top">
                <section className="hero" id="kesfet">
                    <div className="hero-copy"><p className="eyebrow"><span className="live-dot" /> İstanbul'da bugün</p><h1>Yakınında bir şeyler<br /><em>oluyor.</em></h1><p className="hero-text">Aynı merakı paylaşan insanlarla tanış, birlikte yapacak bir şey bul.</p></div>
                    <div className="hero-note"><span>01</span><p>Bugün birbirini hiç tanımayan <strong>24 kişi</strong> aynı etkinlikte buluşuyor.</p><ArrowRight size={18} /></div>
                </section>

                <section className="toolbar" aria-label="Etkinlik filtreleri">
                    <div className="filter-label"><MapPin size={17} /><span>Konum</span><input value={location} onChange={(event) => setLocation(event.target.value)} aria-label="Şehir veya konum ara" /></div>
                    <div className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Etkinlik ara..." aria-label="Etkinlik ara" /></div>
                </section>

                <section className="content-section" id="topluluk">
                    <div className="section-heading"><div><p className="eyebrow">Sana yakın</p><h2>Ne yapmak istersin?</h2></div><button className="text-button" onClick={() => { setActiveCategory('Tümü'); setQuery(''); setLocation('') }}>Tümünü gör <ChevronRight size={17} /></button></div>
                    <div className="category-row">{categories.map((category) => <button key={category.label} className={`category-chip ${activeCategory === category.label ? 'selected' : ''}`} onClick={() => setActiveCategory(category.label)}><span>{category.icon}</span>{category.label}</button>)}</div>
                    <div className="result-meta"><span>{filteredEvents.length} etkinlik bulundu</span><span className="result-line" /></div>
                    {filteredEvents.length > 0 ? <div className="event-grid">{filteredEvents.map((event) => <EventCard key={event.id} event={event} onOpen={() => setSelectedEvent(event)} />)}</div> : <div className="empty-state"><div className="empty-icon"><Search size={22} /></div><h3>Bu aramada bir şey bulamadık.</h3><p>Konum veya arama kelimesini değiştirip tekrar dene.</p><button className="secondary-button" onClick={() => { setQuery(''); setLocation('') }}>Filtreleri temizle</button></div>}
                </section>
            </main>

            {notice && <div className="toast"><Check size={18} /> {notice}</div>}
            {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onJoin={() => joinEvent(selectedEvent.id)} />}
            {isCreateOpen && <CreateModal form={form} error={formError} onClose={() => { setIsCreateOpen(false); setFormError('') }} onChange={updateForm} onSubmit={handleCreate} />}
        </div>
    )
}

function EventCard({ event, onOpen }: { event: EventItem; onOpen: () => void }) {
    return <article className={`event-card ${event.accent}`} onClick={onOpen} tabIndex={0} onKeyDown={(keyboardEvent) => keyboardEvent.key === 'Enter' && onOpen()}>
        <div className="card-top"><span className="category-tag">{event.category}</span><span className="card-date"><CalendarDays size={14} /> {event.date}</span></div>
        <div className="card-illustration"><span className="illustration-symbol">{event.category === 'Spor' ? '◒' : event.category === 'Müzik' ? '♪' : event.category === 'Oyun' ? '♜' : event.category === 'Ders çalışma' ? '⌁' : '○'}</span><span className="card-arrow"><ArrowRight size={17} /></span></div>
        <div className="card-content"><h3>{event.title}</h3><p className="location"><MapPin size={14} /> {event.location}</p><div className="card-footer"><span className="attendees"><Users size={15} /> {event.attendees}/{event.capacity} kişi</span><span className="see-detail">Detay <ChevronRight size={15} /></span></div></div>
    </article>
}

function EventModal({ event, onClose, onJoin }: { event: EventItem; onClose: () => void; onJoin: () => void }) {
    const isFull = event.attendees >= event.capacity && !event.joined
    return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}><button className="icon-button close-button" onClick={onClose} aria-label="Kapat"><X size={20} /></button><div className={`modal-banner ${event.accent}`}><span className="modal-symbol">{event.category === 'Müzik' ? '♪' : event.category === 'Spor' ? '◒' : '○'}</span></div><div className="modal-content"><span className="category-tag">{event.category}</span><h2>{event.title}</h2><p className="modal-description">{event.description}</p><div className="detail-list"><span><MapPin size={17} />{event.location}</span><span><Clock3 size={17} />{event.date}, {event.time}</span><span><Users size={17} />{event.attendees} kişi katılıyor · {event.capacity} kişilik</span></div><div className="host-line"><span className="avatar">{event.host[0]}</span><span><small>Oluşturan</small><strong>{event.host}</strong></span></div><button className={`primary-button full-width ${event.joined ? 'joined' : ''}`} onClick={onJoin} disabled={event.joined || isFull}>{event.joined ? <><Check size={18} /> Katıldın</> : isFull ? 'Kontenjan doldu' : <><Plus size={18} /> Katılmak istiyorum</>}</button></div></div></div>
}

function CreateModal({ form, error, onClose, onChange, onSubmit }: { form: EventForm; error: string; onClose: () => void; onChange: (field: keyof EventForm, value: string | number) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
    return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal create-modal" onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}><div className="modal-heading"><div><p className="eyebrow">Topluluğa katıl</p><h2>Yeni etkinlik oluştur</h2></div><button className="icon-button" onClick={onClose} aria-label="Kapat"><X size={20} /></button></div><form onSubmit={onSubmit}><label>Etkinlik adı<input value={form.title} onChange={(event) => onChange('title', event.target.value)} placeholder="Örn. Sahilde sabah yürüyüşü" /></label><div className="form-grid"><label>Kategori<select value={form.category} onChange={(event) => onChange('category', event.target.value as Category)}>{categories.slice(1).map((category) => <option key={category.label}>{category.label}</option>)}</select></label><label>Konum<input value={form.location} onChange={(event) => onChange('location', event.target.value)} placeholder="Semt veya mekan" /></label><label>Tarih<input type="text" value={form.date} onChange={(event) => onChange('date', event.target.value)} placeholder="Örn. 12 Mayıs" /></label><label>Saat<input type="time" value={form.time} onChange={(event) => onChange('time', event.target.value)} /></label></div><label>Kaç kişi olsun?<input type="number" min="2" max="100" value={form.capacity} onChange={(event) => onChange('capacity', Number(event.target.value))} /></label><label>Biraz anlat<textarea value={form.description} onChange={(event) => onChange('description', event.target.value)} placeholder="Etkinlikte neler olacak?" rows={3} /></label>{error && <p className="form-error">{error}</p>}<button className="primary-button full-width" type="submit"><Plus size={18} /> Etkinliği yayınla</button></form></div></div>
}

export default App

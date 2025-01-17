import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 導航欄 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">伊林SPA</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium transition-colors hover:text-primary"
              >
                登入
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md"
              >
                註冊
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要內容 */}
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
              專業的按摩服務
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              提供優質的泰式、中式按摩服務，讓您的身心靈得到完全的放鬆。
            </p>
            <div className="space-x-4">
              <Link
                href="/services"
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md"
              >
                查看服務項目
              </Link>
              <Link
                href="/booking"
                className="px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md"
              >
                立即預約
              </Link>
            </div>
          </div>
        </section>

        {/* 服務特色 */}
        <section className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              服務特色
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              我們提供專業、貼心的服務，讓您享受最優質的按摩體驗
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">專業按摩師</h3>
                  <p className="text-sm text-muted-foreground">
                    經驗豐富的專業按摩師，提供最優質的服務
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">舒適環境</h3>
                  <p className="text-sm text-muted-foreground">
                    寧靜舒適的環境，讓您完全放鬆身心
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <div className="space-y-2">
                  <h3 className="font-bold">便利預約</h3>
                  <p className="text-sm text-muted-foreground">
                    線上預約系統，讓您輕鬆安排時間
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 頁尾 */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built by 伊林SPA. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

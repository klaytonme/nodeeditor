"use client";

// ─── components/ProjectCard.tsx ───────────────────────────────────────────────
//
//  Renders a single full-width project card with:
//    - Project photo (left, hidden on mobile)
//    - Tab navigation
//    - Body text (centre)
//    - Embedded YouTube video (right, when youtubeId is set)
//    - Links layout (when tab.links is set)

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { codeToHtml } from "shiki";
import { type Info, type Tab, type LinkIcon, infoSrc, CodeSrc } from "./info";

// ─── Icon map for link types ──────────────────────────────────────────────────

const LINK_ICONS: Record<LinkIcon, string> = {
	github: "↗ GitHub",
	docs: "↗ Docs",
	demo: "↗ Demo",
	paper: "↗ Paper",
	video: "↗ Video",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabNav({ tabs, activeId, onSelect }: { tabs: Tab[]; activeId: string; onSelect: (id: string) => void }) {
	return (
		<nav className="flex items-center gap-1 border-b border-border mx-6 overflow-x-auto no-scrollbar">
			{tabs.map((tab) => {
				const isActive = tab.id === activeId;
				return (
					<button
						key={tab.id}
						onClick={() => onSelect(tab.id)}
						className={[
							"relative px-4 py-3 text-xs font-semibold uppercase tracking-widest whitespace-nowrap transition-colors duration-200 cursor-pointer",
							isActive ? "text-primary" : "text-foreground-subtle hover:text-foreground-muted",
						].join(" ")}
						style={{ fontSize: "clamp(0.7rem, 1.3vw, 0.85rem)" }}>
						{tab.label}
						{/* Active indicator bar */}
						{isActive && (
							<motion.div
								layoutId="tab-indicator"
								className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-sm"
								transition={{ type: "spring", stiffness: 400, damping: 35 }}
							/>
						)}
					</button>
				);
			})}
		</nav>
	);
}

function YouTubeEmbed({ videoId }: { videoId: string }) {
	return (
		<div
			className="relative w-full rounded-lg overflow-hidden border border-border bg-surface-raised"
			style={{ aspectRatio: "16/9" }}>
			<iframe
				src={`https://www.youtube.com/embed/${videoId}`}
				title="Project video"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
				className="absolute inset-0 w-full h-full"
			/>
		</div>
	);
}

function LinksPanel({ links }: { links: NonNullable<Tab["links"]> }) {
	return (
		<div
			className={[
				"grid gap-3 w-full mx-auto",
				links.length > 3 ? "grid-cols-2 max-w-250" : "grid-cols-1 max-w-125",
			].join(" ")}>
			{links.map((link, index) => (
				<a
					key={link.url + "-" + index}
					href={link.url}
					target="_blank"
					rel="noopener noreferrer"
					className="group flex items-center justify-between px-5 py-4 rounded-lg border border-border bg-surface-raised hover:border-primary hover:bg-surface transition-all duration-200">
					<span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
						{link.label}
					</span>
					<span className="text-xs text-foreground-subtle group-hover:text-primary transition-colors font-mono">
						{link.icon ? LINK_ICONS[link.icon] : "↗"}
					</span>
				</a>
			))}
		</div>
	);
}

function SkillTags({ tags }: { tags: string[] }) {
	return (
		<div className="flex flex-wrap gap-2 mt-3">
			{tags.map((tag) => (
				<span
					key={tag}
					className="px-2 py-0.5 text-[10px] font-medium font-mono uppercase rounded border border-border text-foreground-muted bg-surface-raised">
					{tag}
				</span>
			))}
		</div>
	);
}

function CodeBlock({ code }: { code: CodeSrc }) {
	const [html, setHtml] = useState("");

	useEffect(() => {
		codeToHtml(code!.src, { lang: "typescript", theme: "material-theme-ocean" }).then(setHtml);
	}, [code]);

	return (
		<>
			<div className="flex flex-row w-full h-8 mt-5 px-5 rounded-t-xl bg-cyan-950 items-center">
				<div className="shrink-0 text-sm font-bold leading-tight text-foreground">{code.title}</div>
				<div className="shrink-0 text-xs leading-tight text-foreground-muted ml-4">{code.filename}</div>
				<div className="flex w-full"></div>
				<a
					key={code.url + "-" + code.title}
					href={code.url}
					target="_blank"
					rel="noopener noreferrer"
					className="group flex shrink-0 items-center justify-between rounded-lg transition-all duration-200">
					<span className="text-xs mr-1 font-medium text-foreground-muted group-hover:text-foreground transition-colors">
						Codebase
					</span>
					<span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors font-mono">
						↗
					</span>
				</a>
			</div>
			<div
				className="text-[14px] [&>pre]:p-5 [&>pre]:overflow-x-scroll rounded-b-2xl overflow-hidden"
				dangerouslySetInnerHTML={{ __html: html }}></div>
		</>
	);
}

// ─── Tab content panel ────────────────────────────────────────────────────────

function TabContent({ tab }: { tab: Tab }) {
	const isLinksTab = tab.links && tab.links.length > 0;
	const hasMedia = !!tab.youtubeId || !!tab.photoSrc;
	const hasVideo = !!tab.youtubeId;
	const hasCode = !!tab.codeSrc;

	return (
		<motion.div
			key={tab.id}
			initial={{ opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -6 }}
			transition={{ duration: 0.2, ease: "easeOut" }}
			className={["flex gap-6 px-12 py-6 w-full", isLinksTab ? "flex-col mx-auto" : "flex-row items-start"].join(
				" ",
			)}>
			{isLinksTab ? (
				<LinksPanel links={tab.links!} />
			) : (
				<div className="gap-6 items-start w-full">
					{/* Video */}
					{hasMedia && (
						<div className="w-full mb-4 md:float-right md:w-[40%] md:shrink-0 md:ml-8">
							{hasVideo ? (
								<YouTubeEmbed videoId={tab.youtubeId!} />
							) : (
								<img src={tab.photoSrc} className="w-full h-full"></img>
							)}
						</div>
					)}
					{/* Body text */}
					<div className={"fw-full md:flex-1 md:min-w-0"}>
						<div
							className="max-w-none text-foreground-muted leading-relaxed text-sm
										[&>p]:mb-3 [&>p:last-child]:mb-0
										[&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-3
										[&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:mb-3
										[&>li]:mb-1
										[&>h3]:text-foreground [&>h3]:font-semibold [&>h3]:mb-2 [&>h3]:mt-4
										[&>strong]:text-foreground [&>strong]:font-semibold
										[&>code]:font-mono [&>code]:text-xs [&>code]:text-primary
										[&>code]:bg-surface-raised [&>code]:px-1 [&>code]:rounded"
							style={{ fontSize: "clamp(0.8rem, 1.6vw, 0.9rem)" }}>
							<ReactMarkdown>{tab.body ?? ""}</ReactMarkdown>
						</div>
					</div>
					{hasCode && <CodeBlock code={tab.codeSrc!}></CodeBlock>}
				</div>
			)}
		</motion.div>
	);
}

// ─── Main ProjectCard ─────────────────────────────────────────────────────────

export const InfoPanel: React.FC<{ hideInfo: () => void }> = ({ hideInfo }) => {
	const info: Info = infoSrc;
	const [activeTabId, setActiveTabId] = useState(info.tabs[0].id);
	const activeTab = info.tabs.find((t) => t.id === activeTabId)!;

	return (
		<article className="relative w-full flex flex-row bg-surface border border-border rounded-xl overflow-hidden shadow-xl">
			{/* Close Button */}
			<div
				className="flex absolute text-[30px] top-3 right-3 w-10 h-10 font-extrabold uppercase rounded-full text-foreground-subtle hover:text-foreground-muted hover:bg-surface-raised border-border border justify-center items-center cursor-pointer"
				onClick={() => {
					hideInfo();
				}}>
				<span>&times;</span>
			</div>

			{/* ── Photo ── */}
			<div className="hidden lg:block shrink-0 relative border-r border-border aspect-3/4 min-w-[18vw]">
				<img
					src={info.photo}
					alt={info.title}
					className="absolute inset-0 w-full h-full object-cover object-center"
				/>
				{/* Subtle gradient over photo bottom */}
				<div
					className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
					style={{
						background: "linear-gradient(to bottom, transparent, black)",
						opacity: 0.4,
						transition: "opacity 0.5s ease",
					}}
				/>
			</div>

			{/* ── Right side: title + nav + content ── */}
			<div className="flex flex-col flex-1 my-6 min-w-0">
				{/* Card header */}
				<div className="px-6 border-border">
					<h2
						className="text-base font-bold text-foreground tracking-tight leading-tight"
						style={{ fontSize: "clamp(1.3rem, 3vw, 1.9rem)" }}>
						{info.title}
					</h2>
					{info.subtitle && (
						<p
							className="text-xs text-foreground-muted mt-1 leading-snug"
							style={{ fontSize: "clamp(0.8rem, 1.9vw, 1.2rem)" }}>
							{info.subtitle}
						</p>
					)}
					{info.tags && <SkillTags tags={info.tags} />}
				</div>
				<>
					<div className="h-px w-full bg-border mt-3"></div>

					{/* Tab navigation */}
					<TabNav tabs={info.tabs} activeId={activeTabId} onSelect={setActiveTabId} />

					{/* Tab content */}
					<div className="flex-1 overflow-hidden">
						<AnimatePresence mode="wait">
							<TabContent key={activeTabId} tab={activeTab} />
						</AnimatePresence>
					</div>
				</>
			</div>
		</article>
	);
};

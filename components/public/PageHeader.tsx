import {
  pageHeaderDescriptionStyle,
  pageHeaderHeadingStyle,
  pageHeaderLabelStyle,
} from "./publicPageStyles";

export { pageHeaderDescriptionStyle, pageHeaderHeadingStyle, pageHeaderLabelStyle };

export type PageHeaderProps = {
  label: string;
  heading: string;
  description: string;
};

/**
 * Shared header section for public pages: small label, main heading, description.
 * Use for Notes, Projects, and any future similar list/detail pages.
 * Style tokens live in publicPageStyles.ts.
 */
export function PageHeader({ label, heading, description }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: "48px" }}>
      <p style={pageHeaderLabelStyle}>{label}</p>
      <h1 style={pageHeaderHeadingStyle}>{heading}</h1>
      <p style={pageHeaderDescriptionStyle}>{description}</p>
    </div>
  );
}

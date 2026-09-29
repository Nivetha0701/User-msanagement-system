import streamlit as st
import requests
import pandas as pd
from datetime import datetime

# Set page configuration
st.set_page_config(
    page_title="User Management Workspace",
    page_icon="👥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom High-End Styling
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }

    /* Metric cards */
    .metric-card {
        background: #ffffff;
        padding: 1.25rem 1.5rem;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        margin-bottom: 1rem;
    }
    .metric-title {
        color: #64748b;
        font-size: 0.82rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .metric-value {
        color: #0f172a;
        font-size: 1.9rem;
        font-weight: 800;
        margin-top: 0.2rem;
    }

    /* Header styling */
    .hero-badge {
        display: inline-flex;
        align-items: center;
        background: #eef2ff;
        color: #4f46e5;
        padding: 0.35rem 0.8rem;
        border-radius: 9999px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
    }

    /* Form styling */
    div[data-testid="stForm"] {
        background: #ffffff;
        padding: 2rem;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    }
</style>
""", unsafe_allow_html=True)

# ----------------- CONFIGURATION & HELPERS -----------------
DEFAULT_API_URL = "http://localhost:8080/api/users"

# Sidebar configuration
with st.sidebar:
    st.markdown("### ⚙️ Backend Settings")
    api_url = st.text_input("Spring Boot API URL", value=DEFAULT_API_URL)
    
    st.markdown("---")
    st.markdown("### 🏢 Workspace Details")
    st.caption("**Project:** User Management System")
    st.caption("**Backend:** Spring Boot (Java 17) + MySQL")
    st.caption("**Frontend:** React 19 & Streamlit")

    st.markdown("---")
    if st.button("🔄 Refresh Data", use_container_width=True):
        st.rerun()

# API Interaction functions
def fetch_users():
    try:
        response = requests.get(api_url, timeout=5)
        if response.status_code == 200:
            return response.json(), True
        return [], False
    except requests.exceptions.RequestException:
        return [], False

def create_user(name, email):
    try:
        response = requests.post(api_url, json={"name": name, "email": email}, timeout=5)
        return response.status_code in [200, 201], response.text
    except requests.exceptions.RequestException as e:
        return False, str(e)

def update_user(user_id, name, email):
    try:
        response = requests.put(f"{api_url}/{user_id}", json={"name": name, "email": email}, timeout=5)
        return response.status_code in [200, 204], response.text
    except requests.exceptions.RequestException as e:
        return False, str(e)

def delete_user(user_id):
    try:
        response = requests.delete(f"{api_url}/{user_id}", timeout=5)
        return response.status_code in [200, 204], response.text
    except requests.exceptions.RequestException as e:
        return False, str(e)

# ----------------- MAIN VIEW -----------------
users, backend_online = fetch_users()

# Header Section
st.markdown('<div class="hero-badge">⚡ Real-Time Streamlit Admin Hub</div>', unsafe_allow_html=True)
st.title("User Management Directory")
st.caption("Manage users, monitor workspace accounts, and sync data in real time with the Spring Boot backend.")

st.markdown("<br>", unsafe_allow_html=True)

# Top Metrics Row
col1, col2, col3 = st.columns(3)

with col1:
    st.markdown(f"""
    <div class="metric-card">
        <div class="metric-title">Total Registered Members</div>
        <div class="metric-value">{len(users)}</div>
    </div>
    """, unsafe_allow_html=True)

with col2:
    status_label = "Online" if backend_online else "Disconnected"
    status_color = "#059669" if backend_online else "#e11d48"
    st.markdown(f"""
    <div class="metric-card">
        <div class="metric-title">Backend API Status</div>
        <div class="metric-value" style="color: {status_color}; font-size: 1.5rem; margin-top: 0.4rem;">
            ● {status_label}
        </div>
    </div>
    """, unsafe_allow_html=True)

with col3:
    st.markdown(f"""
    <div class="metric-card">
        <div class="metric-title">Database Sync</div>
        <div class="metric-value" style="color: #4f46e5; font-size: 1.5rem; margin-top: 0.4rem;">
            MySQL Live
        </div>
    </div>
    """, unsafe_allow_html=True)

if not backend_online:
    st.error("⚠️ Cannot connect to Spring Boot backend at `" + api_url + "`. Ensure the Spring Boot server is running on port 8080.")

# Tabbed Navigation
tab_directory, tab_create, tab_edit, tab_delete = st.tabs([
    "📋 Members Directory",
    "➕ Add New Member",
    "✏️ Edit Member",
    "🗑️ Delete Member"
])

# ---------------- TAB 1: DIRECTORY ----------------
with tab_directory:
    st.subheader("Workspace Members")

    if users:
        df = pd.DataFrame(users)
        
        # Search & Filter bar
        search_query = st.text_input("🔍 Search by Name, Email, or ID", placeholder="Type to filter...")
        
        if search_query:
            q = search_query.lower()
            filtered_df = df[
                df['name'].str.lower().str.contains(q, na=False) |
                df['email'].str.lower().str.contains(q, na=False) |
                df['id'].astype(str).str.contains(q, na=False)
            ]
        else:
            filtered_df = df

        st.dataframe(
            filtered_df,
            column_config={
                "id": st.column_config.NumberColumn("ID", format="%d"),
                "name": st.column_config.TextColumn("Full Name"),
                "email": st.column_config.TextColumn("Email Address"),
            },
            use_container_width=True,
            hide_index=True
        )

        col_left, col_right = st.columns([1, 1])
        with col_left:
            st.caption(f"Showing **{len(filtered_df)}** of **{len(df)}** total members.")
        with col_right:
            csv_data = filtered_df.to_csv(index=False).encode('utf-8')
            st.download_button(
                label="📥 Export to CSV",
                data=csv_data,
                file_name=f"users_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                mime="text/csv",
                use_container_width=True
            )

        # Domain analytics
        if 'email' in df.columns and len(df) > 0:
            st.markdown("---")
            st.markdown("#### 📊 Email Domains Breakdown")
            df['domain'] = df['email'].apply(lambda x: x.split('@')[-1] if '@' in str(x) else 'Other')
            domain_counts = df['domain'].value_counts()
            st.bar_chart(domain_counts)

    else:
        st.info("No user accounts found. Add your first member in the 'Add New Member' tab!")

# ---------------- TAB 2: CREATE MEMBER ----------------
with tab_create:
    st.subheader("Register a New Workspace Member")
    st.caption("Enter the member's credentials to record them directly into the MySQL database.")

    with st.form("create_user_form", clear_on_submit=True):
        new_name = st.text_input("Full Name", placeholder="e.g. Sophia Martinez")
        new_email = st.text_input("Email Address", placeholder="e.g. sophia.m@example.com")
        
        submitted = st.form_submit_button("🚀 Add Member", use_container_width=True)
        if submitted:
            if not new_name.strip() or not new_email.strip():
                st.warning("Please fill out both the Name and Email fields.")
            elif "@" not in new_email:
                st.warning("Please enter a valid email address.")
            else:
                success, msg = create_user(new_name.strip(), new_email.strip())
                if success:
                    st.success(f"Member **{new_name.strip()}** added successfully!")
                    st.balloons()
                    st.rerun()
                else:
                    st.error(f"Failed to create member: {msg}")

# ---------------- TAB 3: EDIT MEMBER ----------------
with tab_edit:
    st.subheader("Update Member Profile")

    if users:
        # Create a dropdown selector mapping
        user_options = {f"{u['name']} (ID: {u['id']}, {u['email']})": u for u in users}
        selected_label = st.selectbox("Select Member to Update", list(user_options.keys()))
        selected_user = user_options[selected_label]

        with st.form("edit_user_form"):
            updated_name = st.text_input("Full Name", value=selected_user.get("name", ""))
            updated_email = st.text_input("Email Address", value=selected_user.get("email", ""))
            
            update_btn = st.form_submit_button("💾 Save Profile Changes", use_container_width=True)
            if update_btn:
                if not updated_name.strip() or not updated_email.strip():
                    st.warning("Name and Email cannot be empty.")
                else:
                    success, msg = update_user(selected_user["id"], updated_name.strip(), updated_email.strip())
                    if success:
                        st.success(f"Member profile for **{updated_name.strip()}** updated successfully!")
                        st.rerun()
                    else:
                        st.error(f"Update failed: {msg}")
    else:
        st.info("No members available to edit.")

# ---------------- TAB 4: DELETE MEMBER ----------------
with tab_delete:
    st.subheader("Remove Member from Workspace")
    st.caption("Carefully select a member to permanently remove their access and database record.")

    if users:
        delete_options = {f"{u['name']} (ID: {u['id']}, {u['email']})": u for u in users}
        target_label = st.selectbox("Select Member to Delete", list(delete_options.keys()), key="delete_select")
        target_user = delete_options[target_label]

        st.warning(f"⚠️ You are about to permanently delete **{target_user['name']}** (`{target_user['email']}`). This action cannot be undone.")

        confirm_delete = st.checkbox("I confirm that I want to remove this member")

        if st.button("🗑️ Delete Member", type="primary", disabled=not confirm_delete, use_container_width=True):
            success, msg = delete_user(target_user["id"])
            if success:
                st.success(f"Member **{target_user['name']}** has been removed.")
                st.rerun()
            else:
                st.error(f"Could not delete member: {msg}")
    else:
        st.info("No members available to delete.")

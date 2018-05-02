<%@ Page Language="C#" %>
<script runat="server">
    protected void Page_Load(object sender, EventArgs e) {
        Response.Redirect("default.aspx" + Request.Url.Query);
    }
</script>

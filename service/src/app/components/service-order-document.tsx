import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

type ServiceOrderPdfData = {
  code: string;
  description: string | null;
  status: string;
  total: unknown;
  createdAt: Date;
  company: {
    name: string;
    document: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    logoUrl: string | null;
  };
  client: {
    name: string;
    document: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  items: {
    serviceName: string;
    quantity: number;
    unitPrice: unknown;
    subtotal: unknown;
  }[];
};

function formatCurrency(value: unknown) {
  const numberValue = Number(value);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numberValue);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  header: {
    marginBottom: 24,
    borderBottom: "1px solid #E5E7EB",
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  headerInfo: {
    flex: 1,
  },
  logo: {
    width: 90,
    height: 60,
    objectFit: "contain",
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 10,
    color: "#4B5563",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    backgroundColor: "#F3F4F6",
    padding: 6,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: 80,
    color: "#4B5563",
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 8,
    border: "1px solid #E5E7EB",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderBottom: "1px solid #E5E7EB",
    padding: 6,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #E5E7EB",
    padding: 6,
  },
  colService: {
    width: "45%",
  },
  colQuantity: {
    width: "15%",
    textAlign: "center",
  },
  colPrice: {
    width: "20%",
    textAlign: "right",
  },
  colSubtotal: {
    width: "20%",
    textAlign: "right",
  },
  totalBox: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  totalText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 32,
    paddingTop: 12,
    borderTop: "1px solid #E5E7EB",
    fontSize: 9,
    color: "#6B7280",
  },
});

export function ServiceOrderDocument({
  order,
}: {
  order: ServiceOrderPdfData;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerInfo}>
              <Text style={styles.title}>Ordem de Serviço</Text>
              <Text style={styles.subtitle}>
                {order.code} • Emitida em {formatDate(order.createdAt)} •
                Status: {order.status}
              </Text>
            </View>

            {order.company.logoUrl && (
              <Image src={order.company.logoUrl} style={styles.logo} />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados da empresa</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Empresa:</Text>
            <Text style={styles.value}>{order.company.name}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Documento:</Text>
            <Text style={styles.value}>{order.company.document ?? "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>E-mail:</Text>
            <Text style={styles.value}>{order.company.email ?? "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Telefone:</Text>
            <Text style={styles.value}>{order.company.phone ?? "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Endereço:</Text>
            <Text style={styles.value}>{order.company.address ?? "-"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do cliente</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.value}>{order.client.name}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Documento:</Text>
            <Text style={styles.value}>{order.client.document ?? "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>E-mail:</Text>
            <Text style={styles.value}>{order.client.email ?? "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Telefone:</Text>
            <Text style={styles.value}>{order.client.phone ?? "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Endereço:</Text>
            <Text style={styles.value}>{order.client.address ?? "-"}</Text>
          </View>
        </View>

        {order.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text>{order.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens da ordem</Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colService}>Serviço</Text>
              <Text style={styles.colQuantity}>Qtd.</Text>
              <Text style={styles.colPrice}>Valor unit.</Text>
              <Text style={styles.colSubtotal}>Subtotal</Text>
            </View>

            {order.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.colService}>{item.serviceName}</Text>
                <Text style={styles.colQuantity}>{item.quantity}</Text>
                <Text style={styles.colPrice}>
                  {formatCurrency(item.unitPrice)}
                </Text>
                <Text style={styles.colSubtotal}>
                  {formatCurrency(item.subtotal)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalText}>
              Total: {formatCurrency(order.total)}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Documento gerado automaticamente pelo ServiceFlow. Esta ordem de
            serviço registra os dados informados pela empresa no momento da
            emissão.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
